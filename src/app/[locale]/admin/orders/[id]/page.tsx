import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { sendOrderStatusEmail } from '@/lib/email'

export default async function AdminOrderDetails({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product:products (
          name_en,
          name_ar,
          product_code
        )
      )
    `)
    .eq('id', id)
    .single()

  if (!order) notFound()

  let bankSlipUrl: string | null = null

  if (order.bank_slip_path) {
    const admin = createAdminClient()
    const { data } = await admin.storage
      .from('bank-slips')
      .createSignedUrl(order.bank_slip_path, 10 * 60)

    bankSlipUrl = data?.signedUrl || null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR',
    }).format(amount || 0)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-700'
      case 'processing':
        return 'bg-blue-100 text-blue-700'
      case 'ready':
        return 'bg-purple-100 text-purple-700'
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-700'
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  async function updateStatus(formData: FormData) {
    'use server'

    const supabase = await createClient()
    const newStatus = formData.get('status') as string



    await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id)
      
    await sendOrderStatusEmail(order, newStatus)

    revalidatePath(`/${locale}/admin/orders/${id}`)
    revalidatePath(`/${locale}/admin/orders`)
    redirect(`/${locale}/admin/orders/${id}`)
  }

  async function updatePaymentStatus(formData: FormData) {
    'use server'

    const supabase = await createClient()
    const newPaymentStatus = formData.get('payment_status') as string

    await supabase
      .from('orders')
      .update({ payment_status: newPaymentStatus })
      .eq('id', id)

    revalidatePath(`/${locale}/admin/orders/${id}`)
    revalidatePath(`/${locale}/admin/orders`)
  }

  const nextStatuses = [
    { label: 'Pending', value: 'pending' },
    { label: 'Processing', value: 'processing' },
    { label: 'Ready', value: 'ready' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ]

  const paymentStatuses = [
    { label: 'Paid', value: 'paid' },
    { label: 'Awaiting Transfer', value: 'awaiting_transfer' },
    { label: 'Unpaid', value: 'unpaid' },
    { label: 'Failed', value: 'failed' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Order #{order.id.slice(0, 8)}
          </h1>

          <p className="text-slate-500 mt-1">
            {order.created_at
              ? new Date(order.created_at).toLocaleString('en-GB')
              : '-'}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
            {order.status || 'pending'}
          </span>

          <span className="px-4 py-2 rounded-full text-sm font-semibold bg-slate-100 text-slate-700">
            {order.payment_status || '-'}
          </span>
        </div>

      </div>

      {/* Actions */}
      <div className="bg-white border rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>
          <h2 className="font-bold mb-3">Update Order Status</h2>

          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((status) => (
              <form key={status.value} action={updateStatus}>
                <input type="hidden" name="status" value={status.value} />
                <button className="border px-4 py-2 rounded-lg hover:bg-slate-100 text-sm">
                  {status.label}
                </button>
              </form>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-bold mb-3">Update Payment Status</h2>

          <div className="flex flex-wrap gap-2">
            {paymentStatuses.map((status) => (
              <form key={status.value} action={updatePaymentStatus}>
                <input type="hidden" name="payment_status" value={status.value} />
                <button className="border px-4 py-2 rounded-lg hover:bg-slate-100 text-sm">
                  {status.label}
                </button>
              </form>
            ))}
          </div>
        </div>

      </div>

      {/* Order Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Customer */}
        <div className="bg-white p-6 rounded-2xl border">
          <h2 className="font-bold mb-4">Customer</h2>

          <div className="space-y-2 text-sm">
            <p><span className="font-semibold">Name:</span> {order.customer_name || '-'}</p>
            <p><span className="font-semibold">Email:</span> {order.email || 'Guest'}</p>
            <p><span className="font-semibold">Phone:</span> <span dir="ltr">{order.phone || '-'}</span></p>
          </div>
        </div>

        {/* Fulfillment */}
        <div className="bg-white p-6 rounded-2xl border">
          <h2 className="font-bold mb-4">Fulfillment</h2>

          <div className="space-y-2 text-sm">
            <p>
              <span className="font-semibold">Method:</span>{' '}
              {order.fulfillment_method || '-'}
            </p>

            {order.fulfillment_method === 'pickup' && (
              <p>
                <span className="font-semibold">Pickup Branch:</span>{' '}
                {order.pickup_branch || '-'}
              </p>
            )}

            {order.fulfillment_method === 'delivery' && (
              <>
                <p><span className="font-semibold">City:</span> {order.city || '-'}</p>
                <p><span className="font-semibold">District:</span> {order.district || '-'}</p>
                <p><span className="font-semibold">Street:</span> {order.street || '-'}</p>
                <p><span className="font-semibold">Building:</span> {order.building || '-'}</p>
                <p><span className="font-semibold">Short Address:</span> {order.short_address || '-'}</p>
                <p><span className="font-semibold">Notes:</span> {order.delivery_notes || '-'}</p>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Payment */}
      <div className="bg-white p-6 rounded-2xl border">
        <h2 className="font-bold mb-4">Payment</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <p><span className="font-semibold">Method:</span> {order.payment_method || '-'}</p>
          <p><span className="font-semibold">Status:</span> {order.payment_status || '-'}</p>
          <p><span className="font-semibold">Fulfillment:</span> {order.fulfillment_method || '-'}</p>
        </div>

        {order.payment_method === 'Bank Transfer' && (
          <div className="mt-4 border-t pt-4 text-sm">
            <span className="font-semibold">Bank Transfer Receipt:</span>{' '}
            {bankSlipUrl ? (
              <a
                href={bankSlipUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                View receipt (link expires in 10 minutes)
              </a>
            ) : (
              <span className="text-red-600">Receipt unavailable</span>
            )}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="bg-white p-6 rounded-2xl border">
        <h2 className="font-bold mb-4">Items</h2>

        <div className="space-y-4">
          {order.order_items?.map((item: any) => (
            <div
              key={item.id}
              className="flex justify-between gap-4 border-b last:border-b-0 pb-3 last:pb-0"
            >
              <div>
                <p className="font-medium">
                  {locale === 'ar'
                    ? item.product?.name_ar || item.product?.name_en || 'Product'
                    : item.product?.name_en || item.product?.name_ar || 'Product'}
                </p>

                <p className="text-sm text-slate-500">
                  Qty: {item.quantity}
                </p>

                <p className="text-sm text-slate-500">
                  Product Code: {item.product_code || item.product?.product_code || '-'}
                </p>

                <p className="text-sm text-slate-500">
                  Variant Code: {item.variant_code || '-'}
                </p>
              </div>

              <div className="text-right">
                <p className="font-semibold">
                  {formatCurrency(item.price || 0)}
                </p>

                <p className="text-sm text-slate-500">
                  Total: {formatCurrency((item.price || 0) * (item.quantity || 0))}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-white p-6 rounded-2xl border max-w-md ml-auto">
        <div className="space-y-3 text-sm">

          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal || 0)}</span>
          </div>

          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span>{formatCurrency(order.delivery_fee || 0)}</span>
          </div>

          <div className="border-t pt-3 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(order.total || 0)}</span>
          </div>

        </div>
      </div>

    </div>
  )
}
