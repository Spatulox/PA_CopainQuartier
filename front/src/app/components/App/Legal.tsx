// src/pages/legal.jsx

import React from 'react';

export default function Legal() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h1>Mentions légales</h1>

      <section style={{ marginBottom: 24 }}>
        <h2>Éditeur du site</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam vitae justo nec massa dictum cursus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.
        </p>
        <ul>
          <li>Raison sociale : Lorem Ipsum SARL</li>
          <li>Adresse : 123 rue Fictive, 75000 Paris</li>
          <li>Téléphone : 01 23 45 67 89</li>
          <li>Email : contact@lorem-ipsum.com</li>
        </ul>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>Hébergement</h2>
        <p>
          Suspendisse potenti. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Mauris euismod, velit non dictum pretium, urna urna cursus enim.
        </p>
        <ul>
          <li>Hébergeur : Ipsum Hosting</li>
          <li>Adresse : 456 avenue Imaginaire, 69000 Lyon</li>
          <li>Téléphone : 09 87 65 43 21</li>
        </ul>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>Propriété intellectuelle</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quisquam, voluptatum. Proin dictum, erat id dictum dictum, enim enim dictum enim, id dictum enim enim.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>Responsabilité</h2>
        <p>
          Nullam euismod, nisi vel consectetur cursus, nisl nisi cursus nisi, vel cursus nisl nisi vel nisi. Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        </p>
      </section>

      <section>
        <h2>Politique de confidentialité</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam vitae justo nec massa dictum cursus. Suspendisse potenti. Mauris euismod, velit non dictum pretium.
        </p>
      </section>
    </div>
  );
}
