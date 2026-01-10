// app/lib/payhere.ts

interface PayHereParams {
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  currency: string;
  amount: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  hash: string;
  sandbox?: string; // '1' for sandbox
}

export const processPayHerePayment = (params: PayHereParams) => {
  // 1. Create a form dynamically
  const form = document.createElement('form');
  form.setAttribute('method', 'POST');
  form.setAttribute('action', 'https://sandbox.payhere.lk/pay/checkout'); 
  form.style.display = 'none';

  // 2. Append all parameters as hidden inputs
  Object.keys(params).forEach(key => {
    const input = document.createElement('input');
    input.setAttribute('type', 'hidden');
    input.setAttribute('name', key);
    // @ts-ignore
    input.setAttribute('value', params[key]);
    form.appendChild(input);
  });

  // 3. Submit the form to redirect user to PayHere
  document.body.appendChild(form);
  form.submit();
};