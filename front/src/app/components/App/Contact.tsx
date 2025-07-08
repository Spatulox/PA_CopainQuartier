// src/pages/contact.jsx

import React, { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleChange = (e:any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e:any) => {
    e.preventDefault();
    alert('Message envoyé ! (simulation)');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h1>Contactez-nous</h1>
      <h2>Nous sommes à votre écoute</h2>
      <p>
        N'hésitez pas à nous contacter pour toute question, suggestion ou demande d'information.
        Notre équipe vous répondra dans les plus brefs délais.
      </p>

      <section style={{ margin: '24px 0' }}>
        <h3>Nos coordonnées</h3>
        <ul>
          <li><strong>Adresse :</strong> 123 rue Imaginaire, 75000 Paris</li>
          <li><strong>Téléphone :</strong> 01 23 45 67 89</li>
          <li><strong>Email :</strong> contact@example.com</li>
        </ul>
      </section>

      <section>
        <h3>Formulaire de contact</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label>
            Nom :
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: 8, marginTop: 4 }}
            />
          </label>
          <label>
            Email :
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: 8, marginTop: 4 }}
            />
          </label>
          <label>
            Message :
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={5}
              style={{ width: '100%', padding: 8, marginTop: 4 }}
            />
          </label>
          <button type="submit" style={{ padding: 10, background: '#0070f3', color: '#fff', border: 'none', borderRadius: 4 }}>
            Envoyer
          </button>
        </form>
      </section>
    </div>
  );
}
