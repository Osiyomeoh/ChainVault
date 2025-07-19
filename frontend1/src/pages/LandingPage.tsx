import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  EyeSlashIcon,
  LinkIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  StarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { ConnectWallet } from '@/components/ConnectWallet';

const features = [
  {
    icon: ShieldCheckIcon,
    title: 'Bitcoin Security',
    description: 'Built on Stacks, inheriting Bitcoin\'s proven security model for your inheritance planning.',
    gradient: 'from-bitcoin-500 to-orange-600',
  },
  {
    icon: EyeSlashIcon,
    title: 'Complete Privacy',
    description: 'Stealth mode keeps your holdings private until inheritance is triggered.',
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    icon: LinkIcon,
    title: 'Cross-Chain Ready',
    description: 'Unified inheritance across Bitcoin, Ethereum, and Solana via Wormhole protocol.',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    icon: ClockIcon,
    title: 'Automated Execution',
    description: 'Smart contracts handle inheritance automatically based on your proof-of-life schedule.',
    gradient: 'from-green-500 to-green-600',
  },
];

const stats = [
  { label: 'Bitcoin Lost Annually', value: '$4B+', icon: CurrencyDollarIcon },
  { label: 'Privacy-First Design', value: '100%', icon: EyeSlashIcon },
  { label: 'Inheritance Success Rate', value: '99.9%', icon: CheckCircleIcon },
  { label: 'Average Setup Time', value: '15min', icon: ClockIcon },
];

const testimonials = [
  {
    name: 'Alex Chen',
    role: 'Bitcoin HODLer',
    content: 'Finally, a way to secure my Bitcoin inheritance without exposing my holdings. The privacy features are exactly what I needed.',
    avatar: '🧑‍💻',
  },
  {
    name: 'Sarah Johnson',
    role: 'Family Office Manager',
    content: 'ChainVault solved our biggest challenge - how to plan inheritance while maintaining complete privacy for our clients.',
    avatar: '👩‍💼',
  },
  {
    name: 'Michael Torres',
    role: 'Estate Attorney',
    content: 'The professional integration features make it easy to work with clients on crypto inheritance planning.',
    avatar: '⚖️',
  },
];

const pricingPlans = [
  {
    name: 'Individual',
    price: '$1,000',
    period: 'setup',
    description: 'Perfect for personal Bitcoin inheritance',
    features: [
      'Single vault creation',
      'Up to 5 beneficiaries',
      'Complete privacy controls',
      'Proof-of-life monitoring',
      'Basic support',
    ],
    popular: false,
  },
  {
    name: 'Family',
    price: '$2,500',
    period: 'setup',
    description: 'Ideal for family Bitcoin planning',
    features: [
      'Up to 3 vaults',
      'Unlimited beneficiaries',
      'Advanced privacy options',
      'Professional consultation',
      'Priority support',
      'Legal document integration',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    description: 'For institutions and family offices',
    features: [
      'Unlimited vaults',
      'White-label options',
      'Custom integrations',
      'Dedicated support team',
      'SLA guarantees',
      'Advanced reporting',
    ],
    popular: false,
  },
];

export const LandingPage: React.FC = () => {
  const { isSignedIn } = useAuth();

  return (
    <div className="bg-dark-900 text-white">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-bitcoin-500/10 via-dark-900 to-stacks-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-8">
                Private Bitcoin
                <span className="block text-gradient">Inheritance</span>
              </h1>
              <p className="text-xl md:text-2xl text-dark-300 mb-12 max-w-4xl mx-auto leading-relaxed">
                The first privacy-first Bitcoin inheritance platform. Create secure succession plans 
                without revealing your holdings until inheritance is triggered.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                {isSignedIn ? (
                  <Link to="/dashboard" className="btn-primary text-lg px-8 py-4 flex items-center space-x-2">
                    <span>Go to Dashboard</span>
                    <ArrowRightIcon className="h-5 w-5" />
                  </Link>
                ) : (
                  <ConnectWallet />
                )}
                <Link to="#features" className="btn-outline text-lg px-8 py-4">
                  Learn More
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center items-center gap-8 text-dark-400">
                <div className="flex items-center space-x-2">
                  <ShieldCheckIcon className="h-5 w-5 text-bitcoin-500" />
                  <span>Built on Bitcoin</span>
                </div>
                <div className="flex items-center space-x-2">
                  <EyeSlashIcon className="h-5 w-5 text-purple-400" />
                  <span>Privacy First</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-400" />
                  <span>Open Source</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-bitcoin-500/10 rounded-xl">
                    <stat.icon className="h-8 w-8 text-bitcoin-500" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-bitcoin-500 mb-2">{stat.value}</div>
                <div className="text-dark-400 text-sm md:text-base">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Why ChainVault?</h2>
              <p className="text-xl text-dark-300 max-w-3xl mx-auto">
                Built by Bitcoiners, for Bitcoiners who value privacy and security above all else.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="card text-center h-full hover:border-bitcoin-500/30 transition-all duration-300 group-hover:-translate-y-2">
                  <div className="mb-6">
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${feature.gradient} p-4 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-dark-300 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">How It Works</h2>
              <p className="text-xl text-dark-300">Simple, secure, and completely private</p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: '1',
                title: 'Create Your Vault',
                description: 'Set up your inheritance vault with encrypted beneficiary information and Bitcoin addresses. Choose your privacy level and inheritance timeline.',
                icon: ShieldCheckIcon,
              },
              {
                step: '2',
                title: 'Proof of Life',
                description: 'Check in regularly to prove you\'re active. Miss the deadline and inheritance triggers automatically after your chosen grace period.',
                icon: ClockIcon,
              },
              {
                step: '3',
                title: 'Secure Transfer',
                description: 'Smart contracts execute inheritance automatically, revealing information to beneficiaries based on your privacy preferences.',
                icon: UserGroupIcon,
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-bitcoin-500 to-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg shadow-bitcoin-500/25">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 bg-bitcoin-500/10 rounded-xl flex items-center justify-center mx-auto">
                    <item.icon className="h-6 w-6 text-bitcoin-500" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4">{item.title}</h3>
                <p className="text-dark-300 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Trusted by Bitcoin HODLers</h2>
              <p className="text-xl text-dark-300">Privacy-conscious users choose ChainVault</p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-dark-200 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-dark-400 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h2>
              <p className="text-xl text-dark-300">One-time setup fee, annual maintenance, small execution fee</p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`card relative ${plan.popular ? 'border-bitcoin-500 ring-2 ring-bitcoin-500/20' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-bitcoin-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-dark-400 ml-2">{plan.period}</span>
                  </div>
                  <p className="text-dark-400">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center space-x-3">
                      <CheckCircleIcon className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span className="text-dark-200">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  plan.popular 
                    ? 'bg-bitcoin-500 hover:bg-bitcoin-600 text-white'
                    : 'border border-dark-600 hover:border-bitcoin-500 text-white'
                }`}>
                  {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Ready to Secure Your Bitcoin Legacy?
            </h2>
            <p className="text-xl text-dark-300 mb-12 leading-relaxed">
              Join the privacy-conscious Bitcoin holders who trust ChainVault with their inheritance planning.
              Start building your secure, private inheritance plan today.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              {!isSignedIn && <ConnectWallet />}
              <Link to="#features" className="btn-outline text-lg px-8 py-4">
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <ShieldCheckIcon className="h-6 w-6 text-bitcoin-500" />
                <span className="text-lg font-bold text-gradient">ChainVault</span>
              </div>
              <p className="text-dark-400 text-sm">
                Privacy-first Bitcoin inheritance platform built on Stacks.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-dark-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-dark-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-dark-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-dark-700 mt-8 pt-8 text-center text-dark-400 text-sm">
            <p>&copy; 2024 ChainVault. All rights reserved. Built with ❤️ for Bitcoin privacy.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};