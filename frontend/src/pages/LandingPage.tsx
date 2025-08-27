import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  EyeSlashIcon,
  LinkIcon,
  CogIcon,
  CheckCircleIcon,
  StarIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { ConnectWallet } from '../components/ConnectWallet';

export function LandingPage() {
  return (
    <div className="bg-dark-900 text-white">
      {/* Header */}
      <header className="relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-bitcoin-600 p-2 rounded-lg">
                <ShieldCheckIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">ChainVault</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <ConnectWallet variant="primary" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
                Private Bitcoin
                <br />
                <span className="bg-gradient-to-r from-bitcoin-500 to-stacks-500 bg-clip-text text-transparent">
                  Inheritance
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                The only privacy-first Bitcoin inheritance platform. Secure your family's future 
                with programmable sBTC and smart contract automation.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link
                  to="/launch-app"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium bg-bitcoin-600 hover:bg-bitcoin-700 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  Launch App
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="#features"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white border-2 border-white/20 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Learn More
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
                <div>
                  <div className="flex items-center justify-center mb-2">
                    <ShieldCheckIcon className="h-6 w-6 text-bitcoin-500" />
                    <span className="ml-2 text-sm font-medium text-bitcoin-500">Built on Bitcoin</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-center mb-2">
                    <EyeSlashIcon className="h-6 w-6 text-stacks-500" />
                    <span className="ml-2 text-sm font-medium text-stacks-500">Privacy First</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-center mb-2">
                    <CogIcon className="h-6 w-6 text-purple-500" />
                    <span className="ml-2 text-sm font-medium text-purple-500">Open Source</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-3xl md:text-4xl font-bold text-bitcoin-500 mb-2">$4B+</div>
              <div className="text-gray-300">Bitcoin lost annually</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="text-3xl md:text-4xl font-bold text-stacks-500 mb-2">100%</div>
              <div className="text-gray-300">Privacy-first design</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-3xl md:text-4xl font-bold text-purple-500 mb-2">99.9%</div>
              <div className="text-gray-300">Inheritance success</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="text-3xl md:text-4xl font-bold text-green-500 mb-2">15min</div>
              <div className="text-gray-300">Average setup time</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why ChainVault is Different
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              The first inheritance platform built specifically for Bitcoin holders who value privacy and security
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: ShieldCheckIcon,
                title: "Bitcoin Security",
                description: "Built on Stacks, secured by Bitcoin's proof-of-work. Your inheritance is protected by the world's most secure blockchain.",
                color: "bitcoin"
              },
              {
                icon: EyeSlashIcon,
                title: "Complete Privacy",
                description: "Stealth mode keeps beneficiaries unaware until inheritance triggers. Zero knowledge proofs protect your family's privacy.",
                color: "stacks"
              },
              {
                icon: LinkIcon,
                title: "Cross-Chain Ready", 
                description: "Wormhole integration enables Bitcoin inheritance across multiple blockchains. Future-proof your legacy.",
                color: "purple"
              },
              {
                icon: CogIcon,
                title: "Automated Execution",
                description: "Smart contracts handle everything automatically. No lawyers, no banks, no third parties required.",
                color: "green"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-dark-800 p-6 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className={`inline-flex p-3 rounded-lg bg-${feature.color}-600/10 mb-4`}>
                  <feature.icon className={`h-6 w-6 text-${feature.color}-500`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-300">Three simple steps to secure your Bitcoin legacy</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Your Vault",
                description: "Set up inheritance parameters, add beneficiaries, and deploy your smart contract. Takes just 15 minutes.",
              },
              {
                step: "02", 
                title: "Proof of Life",
                description: "Regularly check in to show you're still active. Miss the deadline and inheritance automatically triggers.",
              },
              {
                step: "03",
                title: "Secure Transfer",
                description: "sBTC automatically transfers to beneficiaries when conditions are met. Privacy levels control information disclosure.",
              }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-bitcoin-600 text-white font-bold text-lg mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-300">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Bitcoin Holders</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Bitcoin HODLer since 2017",
                content: "Finally, a way to pass on my Bitcoin without compromising privacy. The smart contract automation gives me peace of mind.",
                rating: 5
              },
              {
                name: "Michael Rodriguez",
                role: "Estate Attorney",
                content: "My clients love ChainVault because it handles Bitcoin inheritance without traditional legal complexities. Brilliant solution.",
                rating: 5
              },
              {
                name: "David Kim",
                role: "Family Office Manager",
                content: "Privacy-first approach is exactly what our high-net-worth families need. The stealth mode feature is revolutionary.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-dark-800 p-6 rounded-lg border border-gray-700"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-300">One-time setup fee. No recurring charges.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Individual",
                price: "$1,000",
                description: "Perfect for personal Bitcoin inheritance",
                features: [
                  "Up to 3 beneficiaries",
                  "All privacy levels",
                  "Smart contract deployment",
                  "24/7 monitoring",
                  "Email support"
                ]
              },
              {
                name: "Family",
                price: "$2,500", 
                description: "Ideal for family Bitcoin planning",
                features: [
                  "Up to 10 beneficiaries",
                  "Multi-vault management",
                  "Advanced privacy controls",
                  "Priority support",
                  "Legal document templates"
                ],
                popular: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                description: "For institutions and family offices",
                features: [
                  "Unlimited beneficiaries",
                  "Custom smart contracts", 
                  "Dedicated support",
                  "SLA guarantees",
                  "White-label options"
                ]
              }
            ].map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative p-6 rounded-lg border ${
                  plan.popular 
                    ? 'border-bitcoin-500 bg-bitcoin-600/10' 
                    : 'border-gray-700 bg-dark-800'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-bitcoin-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold mb-2">{plan.price}</div>
                  <p className="text-gray-300">{plan.description}</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <ConnectWallet
                  variant={plan.popular ? "primary" : "outline"}
                  className="w-full justify-center"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Secure Your Bitcoin Legacy Today
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of Bitcoin holders who trust ChainVault to protect their family's future.
              Set up your inheritance vault in minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ConnectWallet size="lg" className="text-lg px-8 py-4" />
              <a
                href="#"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-gray-300 hover:text-white transition-colors"
              >
                View Documentation →
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-bitcoin-600 p-2 rounded-lg">
                  <ShieldCheckIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">ChainVault</span>
              </div>
              <p className="text-gray-400">
                The privacy-first Bitcoin inheritance platform built on Stacks.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Guides</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 ChainVault. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}