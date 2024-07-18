import { prisma } from "@/lib/db"
import { stripe } from "@/lib/stripe"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(req: Request) {
    const body = await req.text()
    const signature = headers().get('Stripe-Signature') as string
    let event: Stripe.Event
    console.log("Beginning of the webhook")

    try {
        event = stripe.webhooks.constructEvent(
            body, signature,
            process.env.STRIPE_WEBHOOK_SECRET as string
        )
        console.log("First rty catch")
    } catch (error: any) {
        console.log("Error occurred")
        return new NextResponse('webhook error', {status: 400})
    }

    const session = event.data.object as Stripe.Checkout.Session
    console.log("Session created: ")
    console.log(session)

    if (event.type === 'checkout.session.completed') {
        console.log("Checkout session completed")
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        if (!session?.metadata?.userId) {
            console.log("No user id")
            return new NextResponse('webhook error, no userId', {status:400})
        }
        console.log("Continuing")
        await prisma.userSubscription.create({
            data: {
                userId: session.metadata.userId,
                stripeSubscriptionId: subscription.id,
                stripeCustomerId: subscription.customer as string,
                stripePriceId: subscription.items.data[0].price.id,
                stripeCurrentPeriodEnd: new Date(
                    subscription.current_period_end * 1000
                )
            }
        })
        console.log("User subscription created")
    }
    console.log("Between if's")
    if (event.type === 'invoice.payment_succeeded') {
        console.log("Entered second if")
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        console.log("Subscription created")
        await prisma.userSubscription.update({
            where: {
                stripeSubscriptionId: subscription.id
            },
            data: {
                stripePriceId: subscription.items.data[0].price.id,
                stripeCurrentPeriodEnd: new Date(
                    subscription.current_period_end * 1000
                )
            }
        })
    }
    console.log("returning")
    return new NextResponse(null, {status: 200})
}

