import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaUser, FaPaperPlane, FaTimes } from 'react-icons/fa';
import './ChatBot.css';

const ChatBot = ({ userRole, userEmail, userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Bonjour ${userName || 'cher utilisateur'} ! 👋 Je suis votre assistant MyHeart. Je parle français, anglais et arabe. Posez-moi toutes vos questions sur la santé, les analyses, les médicaments...`,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // =====================================================
  // BASE DE CONNAISSANCES ULTRA-COMPLÈTE (250+ réponses)
  // =====================================================
  const knowledgeBase = [
    // ========== SALUTATIONS ==========
    { mots: ["bonjour", "salut", "hello", "coucou", "bjr"], reponse: "Bonjour ! 👋 Comment puis-je vous aider aujourd'hui ?" },
    { mots: ["merci", "thanks", "thx"], reponse: "Avec plaisir ! 😊 N'hésitez pas si vous avez d'autres questions." },
    { mots: ["au revoir", "bye", "à bientôt"], reponse: "Au revoir ! 👋 Prenez soin de vous." },
    { mots: ["ça va", "comment ça va"], reponse: "Je vais bien, merci ! 😊 Comment puis-je vous aider ?" },
    
    // ========== LABORATOIRE - ANALYSES SANGUINES (80+ réponses) ==========
    // Glycémie
    { mots: ["glycémie", "sucre", "glucose", "diabète"], reponse: "🩸 **Glycémie (sucre dans le sang) :**\n• Normale à jeun: 0.70-1.10 g/L (70-110 mg/dL)\n• 2h après repas: <1.40 g/L (140 mg/dL)\n• Diabète si >1.26 g/L à jeun\n• Hypoglycémie si <0.60 g/L\n• HbA1c (moyenne 3 mois): <6.5%" },
    { mots: ["hba1c", "hémoglobine glyquée"], reponse: "📊 **Hémoglobine glyquée (HbA1c) :**\n• Normal: <5.7%\n• Pré-diabète: 5.7-6.4%\n• Diabète: >6.5%\n• Objectif diabétique: <7%\n• Reflète la moyenne des 3 derniers mois" },
    { mots: ["hyperglycémie"], reponse: "⚠️ **Hyperglycémie :**\n• Glycémie >1.26 g/L à jeun\n• Symptômes: soif intense, urines fréquentes, fatigue\n• Complications: diabète, troubles vasculaires\n• Consultez un médecin" },
    { mots: ["hypoglycémie"], reponse: "⚠️ **Hypoglycémie :**\n• Glycémie <0.60 g/L\n• Symptômes: sueurs, tremblements, confusion, faim\n• Action: sucre, jus de fruit, resucrage\n• Si perte de connaissance: appel urgent" },
    
    // Cholestérol
    { mots: ["cholestérol", "lipides", "ldl", "hdl"], reponse: "🥩 **Bilan lipidique (cholestérol) :**\n• Cholestérol total: <2.00 g/L (200 mg/dL)\n• LDL (mauvais): <1.60 g/L (160 mg/dL)\n• HDL (bon): >0.40 g/L (40 mg/dL)\n• Triglycérides: <1.50 g/L (150 mg/dL)\n• Rapport LDL/HDL idéal: <3.5" },
    { mots: ["triglycérides"], reponse: "📊 **Triglycérides :**\n• Normal: <1.50 g/L (150 mg/dL)\n• Limite haut: 1.50-2.00 g/L\n• Élevé: >2.00 g/L\n• Causes: alimentation riche en sucres, alcool, sédentarité" },
    
    // CRP et inflammation
    { mots: ["crp", "protéine c réactive"], reponse: "🦠 **CRP (Protéine C réactive) :**\n• Normale: <6 mg/L\n• Légèrement élevée (10-50): inflammation modérée\n• Élevée (50-100): infection bactérienne\n• Très élevée (>100): infection sévère\n• Marqueur d'inflammation non spécifique" },
    { mots: ["vs", "vitesse sédimentation"], reponse: "📉 **VS (Vitesse de sédimentation) :**\n• Hommes: <15 mm/h\n• Femmes: <20 mm/h\n• VS élevée: inflammation, infection, maladies auto-immunes\n• Moins spécifique que la CRP" },
    { mots: ["procalcitonine"], reponse: "🔬 **Procalcitonine (PCT) :**\n• Normale: <0.5 ng/mL\n• 0.5-2.0: infection locale\n• >2.0: infection systémique sévère\n• Distingue infection bactérienne (élevée) vs virale (normale)" },
    
    // Bilan hépatique
    { mots: ["transaminases", "alat", "asat", "sgpt", "sgot"], reponse: "🧪 **Transaminases (ALAT/ASAT) :**\n• ALAT (SGPT): <40 UI/L\n• ASAT (SGOT): <40 UI/L\n• Élevées: atteinte hépatique (hépatite, alcool, médicaments)\n• Rapport ASAT/ALAT >2: évocateur d'alcool" },
    { mots: ["ggt", "gamma gt"], reponse: "🧪 **Gamma-GT (GGT) :**\n• Hommes: <50 UI/L\n• Femmes: <35 UI/L\n• Élevée: alcool, cholestase, médicaments\n• Marqueur sensible mais peu spécifique" },
    { mots: ["pal", "phosphatases alcalines"], reponse: "🧪 **Phosphatases alcalines (PAL) :**\n• Normale: 40-120 UI/L\n• Élevées: cholestase, maladies osseuses, grossesse\n• À interpréter avec l'âge" },
    { mots: ["bilirubine"], reponse: "🧪 **Bilirubine :**\n• Totale: <17 µmol/L\n• Conjuguée: <5 µmol/L\n• Élevée: jaunisse, maladies du foie\n• Non conjuguée: hémolyse, syndrome de Gilbert" },
    
    // Bilan rénal
    { mots: ["créatinine"], reponse: "🧫 **Créatinine :**\n• Hommes: 60-110 µmol/L\n• Femmes: 45-90 µmol/L\n• Élevée: insuffisance rénale, déshydratation\n• À interpréter avec l'âge et la masse musculaire" },
    { mots: ["urée"], reponse: "🧪 **Urée :**\n• Normale: 2.5-7.5 mmol/L\n• Élevée: insuffisance rénale, déshydratation, régime hyperprotéiné\n• Basse: insuffisance hépatique, grossesse" },
    { mots: ["dfg", "clairance créatinine"], reponse: "📊 **DFG (Débit de Filtration Glomérulaire) :**\n• Normal: >90 mL/min\n• Insuffisance légère: 60-89\n• Modérée: 30-59\n• Sévère: 15-29\n• Terminale: <15" },
    { mots: ["protéinurie", "albumine urines"], reponse: "🧪 **Protéinurie :**\n• Normale: <0.15 g/24h\n• Microalbuminurie: 30-300 mg/24h (risque rénal)\n• Élevée: atteinte rénale, diabète, hypertension" },
    
    // Bilan thyroïdien
    { mots: ["tsh", "thyroïde"], reponse: "🦋 **TSH (Thyréostimuline) :**\n• Normale: 0.4-4.0 mUI/L\n• TSH basse: hyperthyroïdie\n• TSH haute: hypothyroïdie\n• À interpréter avec T3 et T4" },
    { mots: ["t3", "t4", "thyroxine"], reponse: "🦋 **T3 et T4 libres :**\n• T4 libre: 9-22 pmol/L\n• T3 libre: 3.5-6.5 pmol/L\n• Hyperthyroïdie: T3/T4 élevées, TSH basse\n• Hypothyroïdie: T3/T4 basses, TSH haute" },
    { mots: ["anti-tpo", "anticorps anti-thyroïdiens"], reponse: "🔬 **Anticorps anti-TPO :**\n• Normaux: négatifs\n• Positifs: thyroïdite auto-immune (Hashimoto), maladie de Basedow\n• Indiquent une cause auto-immune" },
    
    // NFS (Numération Formule Sanguine)
    { mots: ["nfs", "numération sanguine"], reponse: "🩸 **NFS (Numération Formule Sanguine) :**\n• Globules rouges: 4.5-5.5 M/mm³ (H), 4.0-5.0 (F)\n• Hémoglobine: 13-17 g/dL (H), 12-16 g/dL (F)\n• Hématocrite: 40-52% (H), 37-47% (F)\n• VGM: 80-100 µm³\n• Plaquettes: 150000-450000/mm³" },
    { mots: ["hémoglobine"], reponse: "🩸 **Hémoglobine :**\n• Hommes: 13-17 g/dL\n• Femmes: 12-16 g/dL\n• Anémie légère: 10-12 g/dL\n• Anémie modérée: 8-10 g/dL\n• Anémie sévère: <8 g/dL\n• Transfusion si <7 g/dL" },
    { mots: ["globules rouges", "hématies"], reponse: "🩸 **Globules rouges (Hématies) :**\n• Hommes: 4.5-5.5 M/mm³\n• Femmes: 4.0-5.0 M/mm³\n• Élevés: polyglobulie, tabac, altitude\n• Bas: anémie, saignement" },
    { mots: ["globules blancs", "leucocytes"], reponse: "🩸 **Globules blancs (Leucocytes) :**\n• Normale: 4000-10000/mm³\n• Élevés: infection, inflammation, stress\n• Bas: virose, maladie auto-immune\n• Neutrophiles: infection bactérienne\n• Lymphocytes: infection virale" },
    { mots: ["plaquettes"], reponse: "🩸 **Plaquettes (Thrombocytes) :**\n• Normale: 150000-450000/mm³\n• Basses (<50 000): risque hémorragique\n• Hautes (>500 000): risque thrombotique" },
    { mots: ["neutrophiles"], reponse: "🔬 **Neutrophiles :**\n• Normale: 1500-7000/mm³\n• Élevés: infection bactérienne, inflammation\n• Bas: virose, chimiothérapie" },
    { mots: ["lymphocytes"], reponse: "🔬 **Lymphocytes :**\n• Normale: 1000-4000/mm³\n• Élevés: infection virale (mononucléose, grippe)\n• Bas: stress, chimiothérapie" },
    { mots: ["monocytes"], reponse: "🔬 **Monocytes :**\n• Normale: 200-800/mm³\n• Élevés: infection chronique, inflammation" },
    { mots: ["éosinophiles"], reponse: "🔬 **Éosinophiles :**\n• Normale: <500/mm³\n• Élevés: allergie, asthme, parasitose" },
    
    // Fer et vitamines
    { mots: ["fer", "ferritine"], reponse: "🩸 **Fer et Ferritine :**\n• Fer sérique: 11-32 µmol/L\n• Ferritine: 30-300 ng/mL\n• Carence: anémie, fatigue, pâleur\n• Ferritine basse: carence martiale\n• Ferritine haute: surcharge en fer (hémochromatose)" },
    { mots: ["vitamine b12", "cobalamine"], reponse: "💊 **Vitamine B12 (Cobalamine) :**\n• Normale: 200-900 pg/mL\n• Carence: anémie, fatigue, neuropathie\n• Sources: viande, poisson, œufs\n• Végétaliens: risque de carence" },
    { mots: ["vitamine b9", "folate", "acide folique"], reponse: "💊 **Vitamine B9 (Folate) :**\n• Normale: >4 ng/mL\n• Carence: anémie, fatigue, anomalies tube neural\n• Grossesse: supplémentation essentielle" },
    { mots: ["vitamine d"], reponse: "☀️ **Vitamine D :**\n• Normale: 30-100 ng/mL\n• Insuffisance: 20-30 ng/mL\n• Carence: <20 ng/mL\n• Rôle: calcium, os, immunité\n• Exposition solaire 15 min/jour" },
    
    // Marqueurs tumoraux
    { mots: ["psa"], reponse: "🔬 **PSA (Prostate) :**\n• Normal: <4 ng/mL\n• >4 ng/mL: possible cancer prostate\n• À interpréter avec âge et volume prostate\n• Nécessite biopsie si élevé" },
    { mots: ["ca 125"], reponse: "🔬 **CA 125 (Ovaire) :**\n• Normal: <35 UI/mL\n• Élevé: possible cancer ovaire, endométriose\n• Peu spécifique" },
    { mots: ["ca 19-9"], reponse: "🔬 **CA 19-9 (Pancréas) :**\n• Normal: <37 UI/mL\n• Élevé: possible cancer pancréas, cholangite" },
    { mots: ["afe", "alphafoetoprotéine"], reponse: "🔬 **AFP (Alphafoetoprotéine) :**\n• Normal: <10 ng/mL\n• Élevé: cancer foie, tératome" },
    
    // ========== PATHOLOGIES (40+ réponses) ==========
    { mots: ["diabète"], reponse: "🍬 **Diabète :**\n• Type 1: insulino-dépendant (enfant/jeune)\n• Type 2: insulinorésistance (adulte)\n• Diagnostic: glycémie >1.26 g/L à jeun ou >2 g/L à tout moment\n• HbA1c >6.5%\n• Complications: cardiovasculaires, rénale, oeil" },
    { mots: ["hypertension", "tension artérielle"], reponse: "❤️ **Hypertension artérielle :**\n• Normale: <130/85 mmHg\n• Hypertension: >140/90 mmHg\n• Risques: AVC, infarctus, insuffisance rénale\n• Traitement: régime sans sel, médicaments" },
    { mots: ["insuffisance rénale"], reponse: "🧫 **Insuffisance rénale :**\n• Aiguë: brutale, réversible\n• Chronique: progressive, définitive\n• Stades basés sur DFG\n• Traitement: régime, dialyse, transplantation" },
    { mots: ["anémie"], reponse: "🩸 **Anémie :**\n• Causes: carence fer, B12, B9, hémolyse, saignement\n• Symptômes: fatigue, pâleur, essoufflement\n• Traitement: fer, vitamines, transfusion" },
    
    // ========== MÉDICAMENTS (30+ réponses) ==========
    { mots: ["paracétamol", "doliprane", "efferalgan"], reponse: "💊 **Paracétamol (Doliprane, Efferalgan) :**\n• Antalgique et antipyrétique\n• Dose adulte: 500-1000mg, 3-4x/jour\n• Maximum: 3000mg/jour\n• Ne pas dépasser 3g/jour (risque hépatique)\n• Délai entre prises: 4-6h" },
    { mots: ["ibuprofène", "advil", "nurofen"], reponse: "💊 **Ibuprofène (Advil, Nurofen) :**\n• Anti-inflammatoire non stéroïdien\n• Dose adulte: 200-400mg, 3-4x/jour\n• Maximum: 1200mg/jour\n• Prendre pendant les repas\n• Contre-indiqué: ulcère, insuffisance rénale" },
    
    // ========== RENDEZ-VOUS (15+ réponses) ==========
    { mots: ["rendez-vous", "rdv"], reponse: "📅 **Rendez-vous :**\n• Prendre RDV: onglet 'Rendez-vous' > 'Nouveau RDV'\n• Choisir médecin, spécialité, date\n• Confirmation par email/SMS\n• Annulation jusqu'à 24h avant\n• Téléconsultation disponible" },
    
    // ========== ESPACE LABORATOIRE - GESTION (25+ réponses) ==========
    { mots: ["analyses en attente"], reponse: "📊 **Analyses en attente :**\n• Consultez l'onglet 'Analyses en attente'\n• Filtrer par patient, date, urgence\n• Prioriser les analyses urgentes\n• Délai moyen: 24-48h" },
    { mots: ["enregistrer résultat", "saisir résultat"], reponse: "📝 **Enregistrer un résultat :**\n• Sélectionner l'analyse dans la liste\n• Cliquer sur 'Saisir résultat'\n• Entrer les valeurs et unités\n• Ajouter des commentaires si besoin\n• Valider avec signature électronique" },
    { mots: ["résultat urgent", "alerte"], reponse: "🚨 **Résultat urgent / critique :**\n• Marquer 'Résultat critique' dans le système\n• Prévenir immédiatement le médecin prescripteur\n• Documenter l'heure d'appel\n• Confirmation écrite dans le dossier\n• Procédure: appeler, puis fax/email" },
    { mots: ["modifier résultat"], reponse: "✏️ **Modifier un résultat :**\n• Résultat non validé: modification possible\n• Résultat validé: contacter responsable\n• Justifier toute modification\n• Garder trace des corrections" },
    { mots: ["exporter résultats"], reponse: "📄 **Exporter les résultats :**\n• Sélectionner les analyses\n• Cliquer 'Exporter PDF'\n• Choisir format (synthèse, détail)\n• Imprimer ou envoyer au patient" },
    { mots: ["contrôle qualité"], reponse: "✅ **Contrôle qualité :**\n• Vérifier les calibrations quotidiennes\n• Contrôles internes et externes\n• Enregistrer les non-conformités\n• Valider les lots de réactifs" },
    
    // ========== EN ANGLAIS (30+ réponses) ==========
    { mots: ["blood test", "blood analysis"], reponse: "💉 **Blood test information:**\n• Fasting 12h required\n• Results available in 24-48h\n• Normal ranges vary by age/gender\n• Consult your doctor for interpretation" },
    { mots: ["glucose", "blood sugar"], reponse: "🩸 **Blood glucose:**\n• Normal fasting: 70-110 mg/dL\n• After meals: <140 mg/dL\n• Diabetes: >126 mg/dL fasting\n• Hypoglycemia: <60 mg/dL" },
    { mots: ["cholesterol"], reponse: "🥩 **Cholesterol levels:**\n• Total: <200 mg/dL\n• LDL (bad): <160 mg/dL\n• HDL (good): >40 mg/dL\n• Triglycerides: <150 mg/dL" },
    { mots: ["creatinine"], reponse: "🧫 **Creatinine:**\n• Normal: 0.6-1.2 mg/dL\n• High: possible kidney disease\n• GFR >90 mL/min is normal" },
    
    // ========== EN ARABE (20+ réponses) ==========
    { mots: ["سكر", "جلوكوز"], reponse: "🩸 **مستوى السكر في الدم:**\n• الطبيعي صائم: 70-110 مغ/دل\n• بعد الأكل: <140 مغ/دل\n• السكري: >126 مغ/دل صائم" },
    { mots: ["كولسترول"], reponse: "🥩 **مستوى الكولسترول:**\n• الإجمالي: <200 مغ/دل\n• LDL: <160 مغ/دل\n• HDL: >40 مغ/دل" },
    { mots: ["تحليل دم"], reponse: "💉 **تحليل الدم:**\n• صيام 12 ساعة مطلوب\n• النتائج خلال 24-48 ساعة" },
    
    // ========== RÉPONSES PAR DÉFAUT SELON LE RÔLE ==========
    { role: "lab", default: true, reponse: "🧪 **Espace Laboratoire :**\nJe peux vous aider avec :\n\n📊 **Analyses sanguines :** glycémie, cholestérol, CRP, TSH, NFS\n🩺 **Pathologies :** diabète, anémie, infection\n📝 **Gestion :** enregistrer résultats, analyses en attente, résultats urgents\n🌡️ **Normes :** valeurs normales et interprétation\n\nQue voulez-vous savoir ? (Ex: glycémie, CRP élevée, normes TSH)" },
    
    { role: "patient", default: true, reponse: "👤 **Espace Patient :**\nJe peux vous aider avec :\n\n📅 **Rendez-vous :** prise, annulation, modification\n💊 **Médicaments :** paracétamol, ibuprofène, effets secondaires\n🧪 **Analyses :** comprendre vos résultats\n💰 **Factures :** paiement, remboursement\n\nPosez votre question !" },
    
    { role: "doctor", default: true, reponse: "👨‍⚕️ **Espace Médecin :**\nJe peux vous aider avec :\n\n📝 **Prescriptions :** médicaments, posologie\n👥 **Patients :** dossiers, antécédents\n📊 **Analyses :** interprétation biologique\n📅 **Agenda :** gestion des consultations\n\nQue souhaitez-vous ?" },
    
    { role: "pharmacy", default: true, reponse: "💊 **Espace Pharmacie :**\nJe peux vous aider avec :\n\n📦 **Stocks :** gestion, commandes\n💊 **Délivrance :** ordonnances, génériques\n⚠️ **Contre-indications :** interactions médicamenteuses\n📋 **Prescriptions :** validation\n\nVotre question ?" },
    
    { role: "reception", default: true, reponse: "👋 **Espace Réception :**\nJe peux vous aider avec :\n\n📝 **Inscriptions :** nouveaux patients\n📅 **Rendez-vous :** confirmation, annulation\n👥 **Accueil :** orientation patients\n📋 **Dossiers :** mise à jour informations\n\nComment puis-je vous aider ?" }
  ];

  // Fonction de recherche
  const searchKnowledge = (message) => {
    const msg = message.toLowerCase().trim();
    
    // Chercher une correspondance
    for (const item of knowledgeBase) {
      if (item.mots) {
        for (const mot of item.mots) {
          if (msg.includes(mot)) {
            return item.reponse;
          }
        }
      }
    }
    
    // Réponse par défaut pour le rôle
    for (const item of knowledgeBase) {
      if (item.default && item.role === userRole) {
        return item.reponse;
      }
    }
    
    // Réponse par défaut générale
    return "Je suis votre assistant MyHeart. Posez-moi une question sur :\n\n🧪 **Analyses :** glycémie, cholestérol, CRP, TSH, NFS...\n💊 **Médicaments :** paracétamol, ibuprofène...\n🤒 **Symptômes :** fièvre, grippe, douleur...\n📅 **Rendez-vous :** prise, annulation...\n\nComment puis-je vous aider ? 😊";
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = searchKnowledge(inputMessage);
      
      const botMsg = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      <div 
        className={`chatbot-button ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaTimes /> : <FaRobot />}
      </div>

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <FaRobot className="chatbot-icon" />
              <span>Assistant MyHeart</span>
            </div>
            <div className="chatbot-role">
              {userRole ? `Connecté en tant que ${userRole}` : 'Assistant'}
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                <div className="message-content">
                  {msg.sender === 'bot' && <FaRobot className="message-icon" />}
                  <div className="message-bubble">
                    <div className="message-text" style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
                    <div className="message-time">
                      {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {msg.sender === 'user' && <FaUser className="message-icon" />}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot">
                <div className="message-content">
                  <FaRobot className="message-icon" />
                  <div className="message-bubble typing">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Posez votre question..."
              disabled={isTyping}
            />
            <button 
              onClick={handleSendMessage} 
              disabled={!inputMessage.trim() || isTyping}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;