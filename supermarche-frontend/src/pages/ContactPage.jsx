import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import ClientNavbar from '../components/ClientNavbar';

export default function ContactPage() {
  const { success, error } = useToast();
  const [form, setForm] = useState({ nom: '', email: '', sujet: 'Question générale', message: '' });
  const [sending, setSending] = useState(false);

  const handle = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom || !form.email || !form.message) {
      error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setSending(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 900));
    success('✅ Message envoyé ! On vous répond sous 24h.');
    setForm({ nom: '', email: '', sujet: 'Question générale', message: '' });
    setSending(false);
  };

  return (
    <div style={{ fontFamily: 'var(--font-sf)', color: 'var(--apple-text)', background: 'var(--apple-surface)', minHeight: '100vh' }}>
      <ClientNavbar transparentOnTop={true} />

      {/* HERO FULL SCREEN */}
      <section style={{ 
        position: 'relative', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        overflow: 'hidden' 
      }}>
        <img 
          src="https://images.unsplash.com/photo-1516387938699-a93567ec168e?auto=format&fit=crop&q=80&w=2000" 
          alt="Service client" 
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%)' }} />
        
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', maxWidth: 800 }}>
          <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16, color: '#30D158' }}>CONTACT</p>
          <h1 style={{ fontSize: 'clamp(48px, 8vw, 80px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', marginBottom: 24, lineHeight: 1.1 }}>
            Nous sommes là <br/> pour vous.
          </h1>
          <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.9)', margin: 0, lineHeight: 1.5 }}>
            Une question, une remarque ou un problème avec une commande ? Notre équipe vous répond sous 24h.
          </p>
        </div>
      </section>

      {/* CORPS */}
      <section className="apple-section" style={{ background: '#F5F5F7' }}>
        <div className="apple-container" style={{ maxWidth: 1100, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 40, alignItems: 'start' }}>
          
          {/* COLONNE GAUCHE - Formulaire */}
          <div className="apple-card" style={{ padding: 40, order: 2 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1D1D1F', marginBottom: 24 }}>Envoyer un message</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: 16, top: 12, color: '#6E6E73', fontSize: 20 }}>person</span>
                <input type="text" value={form.nom} onChange={handle('nom')} placeholder="Nom complet" className="apple-input" style={{ width: '100%', paddingLeft: 48, boxSizing: 'border-box' }} required />
              </div>
              
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: 16, top: 12, color: '#6E6E73', fontSize: 20 }}>mail</span>
                <input type="email" value={form.email} onChange={handle('email')} placeholder="Adresse email" className="apple-input" style={{ width: '100%', paddingLeft: 48, boxSizing: 'border-box' }} required />
              </div>
              
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: 16, top: 12, color: '#6E6E73', fontSize: 20 }}>help</span>
                <select value={form.sujet} onChange={handle('sujet')} className="apple-input" style={{ width: '100%', paddingLeft: 48, boxSizing: 'border-box', appearance: 'none', backgroundColor: '#fff', cursor: 'pointer' }}>
                  <option value="Question générale">Question générale</option>
                  <option value="Problème de commande">Problème de commande</option>
                  <option value="Retour produit">Retour produit</option>
                  <option value="Autre">Autre</option>
                </select>
                <span className="material-symbols-outlined" style={{ position: 'absolute', right: 16, top: 12, color: '#6E6E73', fontSize: 20, pointerEvents: 'none' }}>expand_more</span>
              </div>
              
              <div>
                <textarea value={form.message} onChange={handle('message')} placeholder="Votre message..." className="apple-input" style={{ width: '100%', height: 'auto', minHeight: 140, paddingTop: 12, paddingBottom: 12, resize: 'vertical', boxSizing: 'border-box' }} required />
              </div>
              
              <button type="submit" disabled={sending} style={{ height: 48, borderRadius: 9999, background: '#0071E3', color: '#fff', border: 'none', fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1, transition: 'background 200ms' }} onMouseEnter={e => { if(!sending) e.currentTarget.style.background = '#006EDB'; }} onMouseLeave={e => { if(!sending) e.currentTarget.style.background = '#0071E3'; }}>
                {sending ? 'Envoi en cours...' : 'Envoyer le message'}
                {!sending && <span className="material-symbols-outlined" style={{ fontSize: 20 }}>send</span>}
              </button>
              
            </form>
          </div>
          
          {/* COLONNE DROITE - Infos de contact */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, order: 1 }}>
            
            {[
              { icon: 'location_on', color: '#0071E3', bg: 'rgba(0,113,227,0.1)', label: 'Adresse', text: 'Casablanca, Maroc' },
              { icon: 'mail', color: '#30D158', bg: 'rgba(48,209,88,0.1)', label: 'Email', text: 'support@lepicerie.ma', href: 'mailto:support@lepicerie.ma' },
              { icon: 'call', color: '#FF9F0A', bg: 'rgba(255,159,10,0.1)', label: 'Téléphone', text: '+212 6 00 00 00 00' },
              { icon: 'schedule', color: '#BF5AF2', bg: 'rgba(191,90,242,0.1)', label: 'Horaires', text: 'Lun–Sam : 8h–20h' },
            ].map((info, i) => (
              <div key={i} style={{ background: '#F5F5F7', borderRadius: 16, padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: info.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 24, color: info.color }}>{info.icon}</span>
                </div>
                <div>
                  <p style={{ fontSize: 13, color: '#6E6E73', marginBottom: 2 }}>{info.label}</p>
                  {info.href ? (
                    <a href={info.href} style={{ fontSize: 16, fontWeight: 600, color: '#0071E3', textDecoration: 'none' }}>{info.text}</a>
                  ) : (
                    <p style={{ fontSize: 16, fontWeight: 600, color: '#1D1D1F', margin: 0 }}>{info.text}</p>
                  )}
                </div>
              </div>
            ))}
            
            {/* Google Maps embed */}
            <div style={{ borderRadius: 16, overflow: 'hidden', height: 200, border: 'none', background: '#e5e5ea', marginTop: 8 }}>
              <iframe
                title="Google Maps Casablanca"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d212526.4185025!2d-7.6623066!3d33.5731104!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda7cd4778aa113b%3A0xb06c1d84f310fd3!2sCasablanca!5e0!3m2!1sfr!2sma!4v1700000000"
                width="100%" height="100%" style={{ border: 'none', display: 'block' }}
                allowFullScreen loading="lazy"
              />
            </div>
            
          </div>
        </div>
      </section>
    </div>
  );
}
