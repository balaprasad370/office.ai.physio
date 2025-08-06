"use client"

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Button from '@/components/atoms/button'
import { ShoppingCart } from 'lucide-react'
import { apiClient } from '@/lib/axios'
import { toast } from 'sonner'

export default function Cart() {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)

  const router = useRouter()

  useEffect(() => {
    fetchCartItems()
  }, [])

  const fetchCartItems = async () => {
    try {
      const response = await apiClient.get(`/v1/cart`)
      console.log(response.data)
      setCartItems(response.data.data || [])
    } catch (error) {
      console.error('Error fetching cart:', error)
      toast.error('Failed to fetch cart items')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveItem = async (cart_id: number) => {
    try {
      const response = await apiClient.delete(`/v1/cart/${cart_id}`)
      console.log(response.data)
      if (response.data.status) {
        toast.success('Item removed from cart')
        fetchCartItems()
      }
    } catch (error) {
      console.error('Error removing item from cart:', error)
      toast.error('Failed to remove item from cart')
    }
  }

  const handleCheckout = async () => {
    try {
      const amount = cartItems.reduce(
        (total, item) => total + parseInt(item.amount),
        0
      )

      if (amount == 0) return;

      const orderData = await fetch(
        'https://server.indephysio.com/create-order',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amount,
            notes: {
              reason: 'Buy subscription from browser',
              payment_gateway: 'schedule_ai_physio',
            },
            receipt: 'Buy subscription',
          }),
        }
      ).then((res) => res.json())

      console.log(orderData)

      const options = {
        key: 'rzp_live_squ9PiHM5Cyog4',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'AI Physio',
        description: 'AI Physio private limited',
        order_id: orderData.id,
        handler: function (response) {
          const paymentdata = {
            amount: amount,
            payment_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            cart_ids: cartItems.map(item => item.cart_id),
          }

          console.log(paymentdata)
          handleUpdatePayment(paymentdata)
        },
        prefill: {
          name: 'AI Physio',
          email: 'ai.physio@gmail.com',
          contact: '9876543210',
        },
        theme: {
          color: '#3399cc',
        },
        modal: {
          ondismiss: function () {
            console.log('====================================')
            console.log('Cancelled')
            console.log('====================================')
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()

    } catch (error) {
      console.error('Error checking out:', error)
      toast.error('Failed to checkout')
    }
  }

  const handleUpdatePayment = async (paymentdata: any) => {
    try {
      const res = await apiClient.post(`/v1/cart/update`, paymentdata)
      console.log(res.data)
      if (res.data.status) {
        toast.success('Payment updated successfully')
        fetchCartItems()
      }
    } catch (error) {
      console.error('Error updating payment:', error)
      toast.error('Failed to update payment')
    }
  }

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='w-10 h-10 border-2 border-n-4 border-t-transparent rounded-full animate-spin'></div>    
      </div>
    )
  }

  return (
    <div className="container mx-auto min-h-screen max-w-4xl px-4 py-8">
      <div className="bg-n-8 rounded-2xl p-8">
        <div className="flex items-center gap-4 mb-8">
          <ShoppingCart className="h-8 w-8 text-color-1" />
          <h1 className="h3 text-n-1">Shopping Cart</h1>
        </div>
        
        <div className="space-y-6">
          {cartItems.length > 0 ? (
            cartItems.map((item, index) => (
              <div 
                key={index}
                className="bg-n-7 rounded-xl p-6 border border-n-6"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <h3 className="body-1 text-n-1">
                      {item.domain_prefix}
                    </h3>
                    <p className="caption text-n-3">
                      Created: {new Date(item.created_date).toLocaleDateString()}
                    </p>
                    <p className="caption text-n-3">
                      Status: {item.is_available ? 'Available' : 'Unavailable'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="body-1 text-color-1">
                      ₹{item.amount}
                    </span>
                    <Button
                      onClick={() => handleRemoveItem(item.cart_id)}
                      className="bg-color-3 hover:bg-color-3/90 text-n-1 rounded-lg hover:text-n-1"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <p className="body-2 text-n-3">Your cart is empty</p>
              <Button
                className="mt-4 bg-color-1 hover:bg-color-1/90 text-n-1 rounded-lg"
                onClick={() => router.push('/dashboard/domains')}
              >
                Browse Domains
              </Button>
            </div>
          )}

          {cartItems.length > 0 && (
            <div className="mt-8 space-y-6">
              <div className="flex justify-between border-t border-n-6 pt-6">
                <span className="body-1 text-n-1">Total</span>
                <span className="h4 text-color-1">
                  ₹{cartItems.reduce((total, item) => total + parseInt(item.amount), 0)}
                </span>
              </div>
              <div className="flex gap-4">
                <Button
                  className="flex-1 bg-n-6 text-n-1 hover:bg-n-5 rounded-lg"
                  onClick={() => router.push('/dashboard/domains')}
                >
                  Add More Domains
                </Button>
                <Button
                  className="flex-1 bg-color-1 text-n-1 hover:bg-color-1/90 py-4 text-lg rounded-lg"
                  onClick={() => handleCheckout()}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
