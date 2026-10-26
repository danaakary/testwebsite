import { useState } from 'react';

const initial = { name: '', email: '', company: '', topic: 'General', message: '', consent: false };

export default function ContactForm() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent

  const update = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = 'Please enter your name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) er.email = 'Please enter a valid email';
    if (form.message.trim().length < 10) er.message = 'Message should be at least 10 characters';
    if (!form.consent) er.consent = 'Please accept to continue';
    return er;
  };

  const submit = async (e) => {
    e.preventDefault();
    const er = validate();
    setErrors(er);
    if (Object.keys(er).length) return;
    setStatus('sending');
    // DEMO ONLY – simulate a network request. Replace with a real endpoint
    // (e.g. an Azure Function under /api) when going live.
    await new Promise((r) => setTimeout(r, 1200));
    console.info('Demo contact submission', form);
    setStatus('sent');
    setForm(initial);
  };

  if (status === 'sent') {
    return (
      <div className="form form--done">
        <div className="check">✓</div>
        <h3>Thanks! Message received.</h3>
        <p>This is a demo, so nothing was actually sent.</p>
        <button className="btn btn--ghost" onClick={() => setStatus('idle')}>Send another</button>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="row">
        <Field label="Name" error={errors.name}>
          <input name="name" value={form.name} onChange={update} placeholder="Jane Doe" />
        </Field>
        <Field label="Email" error={errors.email}>
          <input name="email" type="email" value={form.email} onChange={update} placeholder="jane@company.com" />
        </Field>
      </div>
      <div className="row">
        <Field label="Company (optional)">
          <input name="company" value={form.company} onChange={update} placeholder="Company" />
        </Field>
        <Field label="Topic">
          <select name="topic" value={form.topic} onChange={update}>
            <option>General</option>
            <option>Sales</option>
            <option>Support</option>
            <option>Partnership</option>
          </select>
        </Field>
      </div>
      <Field label="Message" error={errors.message}>
        <textarea name="message" rows="5" value={form.message} onChange={update} placeholder="How can we help?" />
      </Field>
      <label className={`consent ${errors.consent ? 'has-error' : ''}`}>
        <input type="checkbox" name="consent" checked={form.consent} onChange={update} />
        I agree that my details are used to respond to this request.
      </label>
      <button className="btn btn--full" disabled={status === 'sending'}>
        {status === 'sending' ? <span className="spinner" /> : 'Send message'}
      </button>
    </form>
  );
}

function Field({ label, error, children }) {
  return (
    <label className={`field ${error ? 'has-error' : ''}`}>
      <span>{label}</span>
      {children}
      {error && <small>{error}</small>}
    </label>
  );
}
