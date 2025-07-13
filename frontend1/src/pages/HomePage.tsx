import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  EyeSlashIcon,
  LinkIcon,
  ClockIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { ConnectWallet } from '../components/ConnectWallet';

const features = [
  {
    icon: ShieldCheckIcon,
    title: 'Bitcoin Security',
    description: 'Built on Stacks, inheriting Bitcoin\'s proven security model for your inheritance planning.',
  },
  {
    icon: EyeSlashIcon,
    title: 'Privacy First',
    description: 'Complete stealth mode - beneficiaries learn about inheritance only when triggered.',
  },
  {
    icon: LinkIcon,
    title: 'Cross-Chain Ready',
    description: 'Unified inheritance across Bitcoin, Ethereum, and Solana via Wormhole protocol.',
  },
  {
    icon: ClockIcon,
    title: 'Automated Execution',
    description: 'Smart contracts handle inheritance automatically based on your proof-of-life schedule.',
  },
];

const stats = [
  { label: 'Bitcoin Lost Annually', value: '$4B+' },
  { label: 'Privacy-First Design', value: '100%' },
  { label: 'Inheritance Success Rate', value: '99.9%' },
  { label: 'Average Setup Time', value: '15min' },
];

export const HomePage = () => {
  const { isSignedIn } = useAuth();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="text-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Private Bitcoin Inheritance
            <span className="block text-gradient">Built for Privacy</span>
          </h1>
          <p className="text-xl text-dark-300 mb-8 max-w-3xl mx-auto">
            The first privacy-first Bitcoin inheritance platform. Create secure succession plans 
            without revealing your holdings until inheritance is triggered.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isSignedIn ? (
              <Link to="/dashboard" className="btn-primary text-lg px-8 py-3">
                Go to Dashboard
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            ) : (
              <ConnectWallet />
            )}
            <Link to="#features" className="btn-outline text-lg px-8 py-3">
              Learn More
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-dark-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-bitcoin-500 mb-2">{stat.value}</div>
              <div className="text-dark-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why ChainVault?</h2>
          <p className="text-xl text-dark-300 max-w-2xl mx-auto">
            Built by Bitcoiners, for Bitcoiners who value privacy and security above all else.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="card text-center"
            >
              <feature.icon className="h-12 w-12 text-bitcoin-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-dark-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-dark-800/50 rounded-2xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-dark-300">Simple, secure, and completely private</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="w-12 h-12 bg-bitcoin-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-xl font-semibold mb-3">Create Your Vault</h3>
            <p className="text-dark-300">
              Set up your inheritance vault with encrypted beneficiary information and Bitcoin addresses.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center"
          >
            <div className="w-12 h-12 bg-bitcoin-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold mb-3">Proof of Life</h3>
            <p className="text-dark-300">
              Check in regularly to prove you're active. Miss the deadline and inheritance triggers automatically.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <div className="w-12 h-12 bg-bitcoin-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold mb-3">Secure Transfer</h3>
            <p className="text-dark-300">
              Smart contracts execute inheritance automatically, revealing information to beneficiaries.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold mb-6">Ready to Secure Your Bitcoin Legacy?</h2>
          <p className="text-xl text-dark-300 mb-8 max-w-2xl mx-auto">
            Join the privacy-conscious Bitcoin holders who trust ChainVault with their inheritance planning.
          </p>
          {!isSignedIn && (
            <ConnectWallet />
          )}
        </motion.div>
      </section>
    </div>
  );
};
