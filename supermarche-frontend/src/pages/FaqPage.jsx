import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ClientNavbar from '../components/ClientNavbar';

const FAQ_DATA = [
  {
    section: 'Livraison',
    icon: 'local_shipping',
    items: [
      { q: 'Quels sont les délais de livraison ?', a: 'Nous livrons en 2h express dans Casablanca. Les commandes passées avant 18h sont livrées le jour même. Au-delà, livraison le lendemain matin.' },
      { q: 'Livrez-vous dans toute la ville ?', a: 'Nous couvrons actuellement Casablanca, Mohammedia et leurs banlieues. La zone s\'étend progressivement.' },
      { q: 'La livraison est-elle gratuite ?', a: 'Livraison offerte dès 35 DH d\'achat. En dessous, les frais sont de 5.99 DH.' },
    ],
  },
  {
    section: 'Commandes',
    icon: 'inventory_2',
    items: [
      { q: 'Comment suivre ma commande ?', a: 'Dans votre espace "Mes commandes", retrouvez en temps réel le statut : En attente → Confirmée → En livraison → Livrée.' },
      { q: 'Puis-je modifier ma commande après validation ?', a: 'Vous pouvez annuler une commande tant qu\'elle est "En attente". Une fois confirmée, contactez notre service client.' },
      { q: 'Comment annuler une commande ?', a: 'Dans "Mes commandes", cliquez sur "Annuler" si la commande est encore en attente. Le remboursement est immédiat.' },
    ],
  },
  {
    section: 'Produits',
    icon: 'storefront',
    items: [
      { q: 'Vos produits sont-ils frais ?', a: 'Oui, nos arrivages sont quotidiens. Les DLC sont affichées sur chaque produit. Nous garantissons la fraîcheur ou nous remboursons.' },
      { q: 'Comment fonctionne le système de promotions ?', a: 'Les promotions sont affichées avec un badge rouge "-X%". Le prix réduit est automatiquement appliqué au panier et à la commande finale.' },
      { q: 'Y a-t-il des codes promo ?', a: 'Oui ! Inscrivez-vous à notre newsletter pour recevoir des codes exclusifs. Appliquez-les à la page panier avant de valider.' },
    ],
  },
  {
    section: 'Mon compte',
    icon: 'manage_accounts',
    items: [
      { q: 'Comment créer un compte ?', a: 'Cliquez sur "S\'inscrire" en haut à droite. Renseignez nom, email, téléphone et adresse. C\'est gratuit et rapide.' },
      { q: 'J\'ai oublié mon mot de passe. Que faire ?', a: 'Contactez notre support à support@lepicerie.ma ou via le formulaire de contact. Un admin réinitialisera votre mot de passe sous 24h.' },
      { q: 'Mes données sont-elles sécurisées ?', a: 'Oui. Les mots de passe sont hashés avec BCrypt. Nous ne vendons aucune donnée personnelle à des tiers.' },
    ],
  },
];

function AccordionItem({ q, a, isFirst }) {
  const [open, setOpen] = useState(isFirst);
  return (
    <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', transition: 'max-height 300ms ease' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 200ms' }}
        onMouseEnter={e => e.currentTarget.style.background = '#F5F5F7'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <span style={{ fontSize: 16, fontWeight: 600, color: '#1D1D1F' }}>{q}</span>
        <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#1D1D1F', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 300ms ease', flexShrink: 0 }}>expand_more</span>
      </button>
      <div style={{ maxHeight: open ? 500 : 0, overflow: 'hidden', transition: 'max-height 300ms ease' }}>
        <div style={{ padding: '0 24px 20px', transition: 'opacity 300ms ease', opacity: open ? 1 : 0 }}>
          <p style={{ fontSize: 15, color: '#6E6E73', lineHeight: 1.7, margin: 0 }}>{a}</p>
        </div>
      </div>
    </div>
  );
}

export default function FaqPage() {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return FAQ_DATA;
    const q = search.toLowerCase();
    return FAQ_DATA.map(sec => ({
      ...sec,
      items: sec.items.filter(it => it.q.toLowerCase().includes(q) || it.a.toLowerCase().includes(q)),
    })).filter(sec => sec.items.length > 0);
  }, [search]);

  return (
    <div style={{ fontFamily: 'var(--font-sf)', color: 'var(--apple-text)', background: 'var(--apple-surface)', minHeight: '100vh' }}>
      <ClientNavbar transparentOnTop={true} />

      {/* HEADER FULL SCREEN */}
      <section style={{ 
        position: 'relative', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        textAlign: 'center', 
        color: '#fff',
        overflow: 'hidden'
      }}>
        <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2000&auto=format&fit=crop" alt="FAQ" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2))' }} />
        
        <div style={{ position: 'relative', zIndex: 1, padding: '0 24px', maxWidth: 800, width: '100%' }}>
          <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16, color: '#32ADE6' }}>AIDE & SUPPORT</p>
          <h1 style={{ fontSize: 'clamp(48px, 8vw, 80px)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 24, lineHeight: 1.1 }}>
            Questions fréquentes.
          </h1>
          <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.9)', marginBottom: 48, lineHeight: 1.5 }}>
            Trouvez rapidement une réponse à votre question parmi les sujets les plus abordés.
          </p>
          
          {/* Search */}
          <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative' }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', fontSize: 24, color: 'rgba(255,255,255,0.6)' }}>search</span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une question..."
              style={{ width: '100%', height: 56, paddingLeft: 56, paddingRight: 24, borderRadius: 9999, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', fontSize: 17, color: '#fff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 200ms, background 200ms' }}
              onFocus={e => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.background = 'rgba(0,0,0,0.6)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'rgba(0,0,0,0.4)'; }}
            />
          </div>
        </div>
      </section>

      {/* CORPS FAQ */}
      <section className="apple-section" style={{ background: '#F5F5F7' }}>
        <div className="apple-container" style={{ maxWidth: 800 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#D5D5D7', display: 'block', marginBottom: 16 }}>search_off</span>
              <p style={{ fontSize: 18, fontWeight: 600, color: '#6E6E73' }}>Aucun résultat pour "{search}"</p>
            </div>
          ) : filtered.map((sec) => (
            <div key={sec.section} style={{ marginBottom: 48 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#1D1D1F' }}>{sec.icon}</span>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1D1D1F', letterSpacing: '-0.02em' }}>{sec.section}</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sec.items.map((item, j) => (
                  <AccordionItem key={j} q={item.q} a={item.a} isFirst={j === 0} />
                ))}
              </div>
            </div>
          ))}

          {/* Contact CTA */}
          <div style={{ background: '#0071E3', borderRadius: 24, padding: 48, textAlign: 'center', color: '#fff', marginTop: 64 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>support_agent</span>
            <h3 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12 }}>Vous n'avez pas trouvé votre réponse ?</h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 32, fontSize: 17 }}>Notre équipe est disponible du lundi au samedi, de 8h à 20h.</p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="mailto:support@lepicerie.ma" style={{ padding: '0 24px', height: 44, borderRadius: 9999, background: '#fff', color: '#0071E3', fontWeight: 600, fontSize: 15, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>mail</span> Envoyer un email
              </a>
              <a href="tel:+212600000000" style={{ padding: '0 24px', height: 44, borderRadius: 9999, background: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600, fontSize: 15, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>call</span> Nous appeler
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
