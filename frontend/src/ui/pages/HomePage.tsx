import {
  Brain,
  Zap,
  Shield,
  Network,
  Database,
  ArrowRight,
  Globe,
  BookText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TitleBar from '../components/TitleBar';
import { motion, type Variants } from 'framer-motion';

const Homepage = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };
  const navigate = useNavigate();

  const features = [
    {
      icon: Database,
      title: 'Decentralized Storage',
      description:
        'Upload your datasets and models to Akave for secure, distributed storage',
      color: 'text-blue-400',
    },
    {
      icon: Network,
      title: 'Distributed Training',
      description:
        'Leverage our global network of trainer nodes for efficient AI model training',
      color: 'text-purple-400',
    },
    {
      icon: Shield,
      title: 'Blockchain Security',
      description:
        'Trained weights stored on Hedera blockchain with cryptographic verification',
      color: 'text-emerald-400',
    },
    {
      icon: Zap,
      title: 'Pay-per-Training',
      description:
        'Only pay for successful training jobs with transparent, token-based pricing',
      color: 'text-yellow-400',
    },
  ];

  const handleStartTraining = () => {
    navigate('/training');
  };

  return (
    <div className='flex flex-col h-screen bg-background'>
      <div className='fixed top-0 left-0 right-0 z-50'>
        <TitleBar />
      </div>

      <div
        className='flex-1 relative overflow-y-auto no-scrollbar'
        style={{ paddingTop: '48px' }}
      >
        <div className='svg-background min-h-full'>
          <div className='absolute inset-0 bg-background/40 pointer-events-none'></div>

          <div className='relative z-10 min-h-full flex flex-col'>
            <div className='flex items-center justify-center px-8 py-24 min-h-[calc(100vh-48px)]'>
              <motion.div
                variants={containerVariants}
                initial='hidden'
                animate='visible'
                className='max-w-6xl mx-auto text-center'
              >
                <motion.h1
                  variants={itemVariants}
                  className='text-5xl md:text-7xl font-bold text-text-primary mb-4'
                >
                  Forge the Future of AI
                </motion.h1>

                <motion.h2
                  variants={itemVariants}
                  className='text-4xl md:text-6xl font-bold mb-6'
                >
                  <span className='block bg-gradient-to-r from-primary via-purple-400 to-emerald-400 bg-clip-text text-transparent animate-gradient-x bg-300%'>
                    On a Trustless Network
                  </span>
                </motion.h2>

                <motion.p
                  variants={itemVariants}
                  className='text-xl md:text-2xl text-text-secondary max-w-4xl mx-auto leading-relaxed mb-10'
                >
                  A decentralized platform for collaborative machine learning.
                  Securely launch training jobs, pay with crypto, and receive
                  results on-chain.
                </motion.p>

                <motion.div
                  variants={itemVariants}
                  className='flex flex-col sm:flex-row gap-6 items-center justify-center'
                >
                  <button
                    onClick={handleStartTraining}
                    className='group relative px-8 py-4 bg-primary text-background font-bold text-lg rounded-full 
                               hover:bg-primary/90 transition-all duration-300 flex items-center gap-3
                               shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105'
                  >
                    <span>Start Training</span>
                    <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
                  </button>

                  <a
                    href='https://docs.hedera.com/' // Replace with your actual docs link
                    target='_blank'
                    rel='noopener noreferrer'
                    className='group px-8 py-4 bg-transparent text-text-secondary font-semibold text-lg rounded-full
                               border-2 border-border hover:border-primary hover:text-primary transition-all duration-300 
                               flex items-center gap-3 hover:scale-105'
                  >
                    <BookText className='w-5 h-5' />
                    <span>Read Docs</span>
                  </a>
                </motion.div>
              </motion.div>
            </div>

            <div className='py-16 px-8'>
              <div className='max-w-6xl mx-auto'>
                <div className='text-center mb-12'>
                  <h2 className='text-3xl md:text-4xl font-bold text-text-primary mb-4'>
                    How DecentraAI Works
                  </h2>
                  <p className='text-lg text-text-secondary max-w-2xl mx-auto'>
                    A simple 4-step process to train your AI models on our
                    decentralized network
                  </p>
                </div>

                <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16'>
                  <div className='text-center group'>
                    <div className='w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-primary/30 group-hover:bg-primary/30 transition-colors duration-300'>
                      <span className='text-2xl font-bold text-primary'>1</span>
                    </div>
                    <h3 className='text-lg font-semibold text-text-primary mb-2'>
                      Upload Data
                    </h3>
                    <p className='text-text-secondary text-sm'>
                      Upload your dataset and Python training script to Akave
                      storage
                    </p>
                  </div>

                  <div className='text-center group'>
                    <div className='w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-primary/30 group-hover:bg-primary/30 transition-colors duration-300'>
                      <span className='text-2xl font-bold text-primary'>2</span>
                    </div>
                    <h3 className='text-lg font-semibold text-text-primary mb-2'>
                      Pay Tokens
                    </h3>
                    <p className='text-text-secondary text-sm'>
                      Pay training fees in HBAR or other supported tokens
                    </p>
                  </div>

                  <div className='text-center group'>
                    <div className='w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-primary/30 group-hover:bg-primary/30 transition-colors duration-300'>
                      <span className='text-2xl font-bold text-primary'>3</span>
                    </div>
                    <h3 className='text-lg font-semibold text-text-primary mb-2'>
                      Network Training
                    </h3>
                    <p className='text-text-secondary text-sm'>
                      Multiple trainer nodes compete to train your model
                      efficiently
                    </p>
                  </div>

                  <div className='text-center group'>
                    <div className='w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-primary/30 group-hover:bg-primary/30 transition-colors duration-300'>
                      <span className='text-2xl font-bold text-primary'>4</span>
                    </div>
                    <h3 className='text-lg font-semibold text-text-primary mb-2'>
                      Get Results
                    </h3>
                    <p className='text-text-secondary text-sm'>
                      Download trained weights from Hedera blockchain storage
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div className='py-16 px-8'>
              <div className='max-w-6xl mx-auto'>
                <div className='text-center mb-12'>
                  <h2 className='text-3xl md:text-4xl font-bold text-text-primary mb-4'>
                    Why Choose DecentraAI?
                  </h2>
                  <p className='text-lg text-text-secondary max-w-2xl mx-auto'>
                    Built on cutting-edge decentralized technologies for secure,
                    efficient AI training
                  </p>
                </div>

                <div className='grid md:grid-cols-2 gap-8'>
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className='bg-surface/30 backdrop-blur-sm border border-border/50 rounded-xl p-8 hover:bg-surface/50 transition-all duration-300 group'
                    >
                      <div className='flex items-start gap-4'>
                        <div
                          className={`w-12 h-12 bg-surface rounded-lg flex items-center justify-center border border-border group-hover:scale-110 transition-transform duration-300`}
                        >
                          <feature.icon
                            className={`w-6 h-6 ${feature.color}`}
                          />
                        </div>
                        <div className='flex-1'>
                          <h3 className='text-xl font-semibold text-text-primary mb-3'>
                            {feature.title}
                          </h3>
                          <p className='text-text-secondary leading-relaxed'>
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className='py-16 px-8'>
              <div className='max-w-4xl mx-auto text-center'>
                <div className='bg-surface/20 backdrop-blur-sm border border-border/50 rounded-2xl p-8 md:p-12'>
                  <Globe className='w-16 h-16 text-primary mx-auto mb-6 animate-pulse' />
                  <h2 className='text-3xl md:text-4xl font-bold text-text-primary mb-4'>
                    Ready to Decentralize Your AI Training?
                  </h2>
                  <p className='text-lg text-text-secondary mb-8 max-w-2xl mx-auto'>
                    Join thousands of developers using DecentraAI to train
                    models faster, cheaper, and more securely than traditional
                    cloud platforms.
                  </p>
                  <button
                    onClick={handleStartTraining}
                    className='group relative px-8 py-4 bg-primary text-background font-bold text-lg rounded-xl
                         hover:bg-primary/90 transition-all duration-300 flex items-center gap-3 mx-auto
                         shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105'
                  >
                    <Brain className='w-5 h-5' />
                    <span>Start Your First Training</span>
                    <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
