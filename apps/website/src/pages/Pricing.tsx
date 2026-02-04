import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useSound } from '@/components/effects/SoundEffects';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ScrollSection from '@/components/effects/ScrollSection';
import SEO from '@/components/SEO';

const plans = [
  { name: 'Free', priceWeekly: 0, priceYearly: 0, currency: '$', features: ['3 projects', 'Basic analytics', 'Mobile app', 'Email support'] },
  { name: 'Pro', priceWeekly: 2.5, priceYearly: 100, currency: '$', features: ['Unlimited projects', 'AI insights', 'Focus mode', 'Priority support', 'Integrations'], popular: true, planId: 'pro' },
  { name: 'Team', priceWeekly: 7, priceYearly: 150, currency: '$', features: ['Everything in Pro', 'Team analytics', 'Admin dashboard', 'SSO', 'API access'], planId: 'team' },
];

const faqs = [
  { q: 'Can I change plans at any time?', a: 'Yes! Upgrade or downgrade anytime.' },
  { q: 'Is there a free trial?', a: 'All paid plans include a 14-day free trial.' },
  { q: 'Do you offer refunds?', a: 'Yes, 30-day money-back guarantee.' },
];

// Comparison features - comparing our plans with "Competitor A" (Clockify-like) and "Competitor B" (Toggle-like)
const comparisonFeatures = [
  { feature: 'Unlimited Time Tracking', ours: { free: true, pro: true, team: true }, competitorA: true, competitorB: true },
  { feature: 'AI-Powered Insights', ours: { free: false, pro: true, team: true }, competitorA: false, competitorB: false },
  { feature: 'Focus Mode', ours: { free: false, pro: true, team: true }, competitorA: false, competitorB: 'limited' },
  { feature: 'Mobile App', ours: { free: true, pro: true, team: true }, competitorA: true, competitorB: true },
  { feature: 'Team Analytics', ours: { free: false, pro: false, team: true }, competitorA: 'paid', competitorB: 'paid' },
  { feature: 'SSO / SAML', ours: { free: false, pro: false, team: true }, competitorA: 'enterprise', competitorB: 'enterprise' },
  { feature: 'API Access', ours: { free: false, pro: false, team: true }, competitorA: 'limited', competitorB: true },
  { feature: 'Priority Support', ours: { free: false, pro: true, team: true }, competitorA: 'paid', competitorB: 'paid' },
  { feature: 'Custom Integrations', ours: { free: false, pro: true, team: true }, competitorA: 'limited', competitorB: 'limited' },
  { feature: 'Offline Mode', ours: { free: true, pro: true, team: true }, competitorA: false, competitorB: true },
  { feature: 'Weekly Pricing Option', ours: { free: true, pro: true, team: true }, competitorA: false, competitorB: false },
];

const FeatureStatus = ({ value }: { value: boolean | string }) => {
  if (value === true) return <Check className="w-5 h-5 text-primary mx-auto" />;
  if (value === false) return <X className="w-5 h-5 text-muted-foreground/50 mx-auto" />;
  return <span className="text-xs text-muted-foreground capitalize">{value}</span>;
};

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { playClick, playToggle } = useSound();

  return (
    <div className="grain">
      <SEO
        title="Pricing"
        description="Simple, transparent pricing. Start free, upgrade when you're ready. Compare our plans and see how Wakey stacks up against alternatives."
      />
      <Navbar />
      <main className="pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollSection fadeIn fadeOut parallax className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-serif mb-6">Simple <span className="gradient-text">pricing</span></h1>
            <p className="text-xl text-muted-foreground">Start free, upgrade when you're ready.</p>
          </ScrollSection>

          <ScrollSection fadeIn fadeOut parallax className="mb-20">
            <div className="flex justify-center items-center gap-4 mb-12">
              <span className={`text-sm ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>Weekly</span>
              <button onClick={() => { setIsYearly(!isYearly); playToggle(); }} className={`relative w-12 h-6 rounded-full transition-colors ${isYearly ? 'bg-primary' : 'bg-muted'}`}>
                <motion.div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white" animate={{ x: isYearly ? 20 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
              </button>
              <span className={`text-sm ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>Yearly <span className="text-secondary text-xs">Save more</span></span>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const checkoutUrl = plan.planId
                  ? `/checkout?plan=${plan.planId}&billing=${isYearly ? 'yearly' : 'weekly'}`
                  : '/coming-soon';
                return (
                  <div key={plan.name} className={`premium-card ${plan.popular ? 'border-primary/50' : ''}`}>
                    {plan.popular && <div className="text-xs text-primary mb-4">Most Popular</div>}
                    <h3 className="text-xl font-serif">{plan.name}</h3>
                    <div className="my-4"><span className="text-4xl font-serif">{plan.currency}{isYearly ? plan.priceYearly : plan.priceWeekly}</span><span className="text-muted-foreground">{isYearly ? '/yr' : '/wk'}</span></div>
                    <ul className="space-y-3 mb-6">{plan.features.map(f => <li key={f} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-primary" />{f}</li>)}</ul>
                    <Link to={checkoutUrl} className={`block w-full text-center py-2.5 rounded-lg font-medium ${plan.popular ? 'btn-primary' : 'btn-secondary'}`} onClick={playClick}>
                      {plan.planId ? 'Get Started' : 'Sign Up Free'}
                    </Link>
                  </div>
                );
              })}
            </div>
          </ScrollSection>

          {/* Comparison Table */}
          <ScrollSection fadeIn fadeOut parallax className="mb-20">
            <h2 className="text-2xl sm:text-3xl font-serif mb-4 text-center">How we <span className="gradient-text">compare</span></h2>
            <p className="text-muted-foreground text-center mb-8">See how our plans stack up against leading alternatives</p>

            <div className="premium-card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead className="w-[200px] font-medium">Feature</TableHead>
                      <TableHead className="text-center font-medium">
                        <div className="flex flex-col items-center">
                          <span className="text-primary font-serif">Ours</span>
                          <span className="text-xs text-muted-foreground font-normal">Free</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center font-medium">
                        <div className="flex flex-col items-center">
                          <span className="text-primary font-serif">Ours</span>
                          <span className="text-xs text-muted-foreground font-normal">Pro</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center font-medium">
                        <div className="flex flex-col items-center">
                          <span className="text-primary font-serif">Ours</span>
                          <span className="text-xs text-muted-foreground font-normal">Team</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center font-medium">
                        <div className="flex flex-col items-center">
                          <span className="text-muted-foreground">Alternative A</span>
                          <span className="text-xs text-muted-foreground font-normal">Pro Plan</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center font-medium">
                        <div className="flex flex-col items-center">
                          <span className="text-muted-foreground">Alternative B</span>
                          <span className="text-xs text-muted-foreground font-normal">Pro Plan</span>
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisonFeatures.map((row, index) => (
                      <TableRow key={row.feature} className={index % 2 === 0 ? 'bg-muted/20' : ''}>
                        <TableCell className="font-medium text-sm">{row.feature}</TableCell>
                        <TableCell className="text-center"><FeatureStatus value={row.ours.free} /></TableCell>
                        <TableCell className="text-center bg-primary/5"><FeatureStatus value={row.ours.pro} /></TableCell>
                        <TableCell className="text-center"><FeatureStatus value={row.ours.team} /></TableCell>
                        <TableCell className="text-center"><FeatureStatus value={row.competitorA} /></TableCell>
                        <TableCell className="text-center"><FeatureStatus value={row.competitorB} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </ScrollSection>

          <ScrollSection fadeIn fadeOut parallax className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-serif mb-8 text-center">FAQ</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="premium-card">
                  <button onClick={() => { setOpenFaq(openFaq === i ? null : i); playClick(); }} className="w-full text-left flex justify-between items-center">
                    <span className="font-medium">{faq.q}</span><span className="text-2xl text-muted-foreground">{openFaq === i ? '−' : '+'}</span>
                  </button>
                  {openFaq === i && <p className="text-muted-foreground text-sm mt-4">{faq.a}</p>}
                </div>
              ))}
            </div>
          </ScrollSection>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
