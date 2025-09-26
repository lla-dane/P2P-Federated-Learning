import React, { useState } from 'react';
import { useTraining } from '../../contexts/TrainingContext';
import {
  Coins,
  Loader2,
  Wallet,
  Shield,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  DollarSign,
  Network,
  Users,
  Clock,
  Zap,
  Play,
} from 'lucide-react';
import { toast } from 'sonner';

export const PaymentPhase = () => {
  const { payAndInitialize, isLoading, trainerCount } = useTraining();
  const [tokenAmount, setTokenAmount] = useState('0.1');

  const handlePayment = () => {
    if (!tokenAmount || parseFloat(tokenAmount) < 0.1) {
      toast.warning('Invalid token amount', {
        description: 'Minimum 0.1 HBAR required.',
      });
      return;
    }
    payAndInitialize(tokenAmount);
  };

  const calculateBreakdown = (amount: string) => {
    const total = parseFloat(amount || '0');
    return {
      trainerRewards: (total * 0.85).toFixed(3),
      networkFees: (total * 0.1).toFixed(3),
      platformFee: (total * 0.05).toFixed(3),
      usdValue: (total * 0.05).toFixed(3), // Mock HBAR to USD rate
      estimatedTime: Math.ceil(total * 10) + ' minutes', // Mock time estimation
    };
  };

  const breakdown = calculateBreakdown(tokenAmount);

  return (
    <div className='bg-surface rounded-xl border border-border overflow-hidden'>
      {isLoading ? (
        /* Loading State */
        <div className='p-8'>
          <div className='text-center'>
            <div className='relative mb-6'>
              <div className='w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto border-2 border-primary/20'>
                <Wallet className='w-10 h-10 text-primary animate-pulse' />
              </div>
              <div className='absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full animate-ping'></div>
            </div>

            <h2 className='text-2xl font-bold text-text-primary mb-3'>
              Processing Payment
            </h2>
            <p className='text-text-secondary mb-6 max-w-md mx-auto leading-relaxed'>
              Please confirm the transaction in your connected wallet. Do not
              close this window while processing.
            </p>

            {/* Progress Steps */}
            <div className='flex justify-center items-center gap-4 mb-6'>
              <div className='flex items-center gap-2'>
                <div className='w-8 h-8 bg-primary rounded-full flex items-center justify-center'>
                  <CheckCircle2 className='w-5 h-5 text-background' />
                </div>
                <span className='text-sm text-text-primary'>
                  Amount Confirmed
                </span>
              </div>
              <div className='w-8 h-px bg-border'></div>
              <div className='flex items-center gap-2'>
                <div className='w-8 h-8 bg-primary/50 rounded-full flex items-center justify-center animate-pulse'>
                  <Loader2 className='w-4 h-4 text-background animate-spin' />
                </div>
                <span className='text-sm text-primary'>Processing Payment</span>
              </div>
              <div className='w-8 h-px bg-border'></div>
              <div className='flex items-center gap-2'>
                <div className='w-8 h-8 bg-surface border border-border rounded-full flex items-center justify-center'>
                  <Play className='w-4 h-4 text-text-secondary' />
                </div>
                <span className='text-sm text-text-secondary'>
                  Initialize Training
                </span>
              </div>
            </div>

            <div className='bg-primary/10 border border-primary/20 rounded-lg p-4'>
              <div className='flex items-center justify-center gap-2 mb-2'>
                <Clock className='w-4 h-4 text-primary' />
                <span className='text-sm font-medium text-primary'>
                  Transaction Details
                </span>
              </div>
              <div className='text-xs text-text-secondary space-y-1'>
                <div>
                  Amount: {tokenAmount} HBAR (~${breakdown.usdValue} USD)
                </div>
                <div>Network: Hedera Testnet</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Payment Form */
        <>
          {/* Header */}
          <div className='bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b border-border'>
            <div className='flex items-center gap-4'>
              <div className='w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30'>
                <CreditCard className='w-6 h-6 text-primary' />
              </div>
              <div>
                <h2 className='text-2xl font-bold text-text-primary'>
                  Initialize Training Round
                </h2>
                <p className='text-text-secondary'>
                  Pay to start distributed AI training across{' '}
                  {trainerCount || 'multiple'} nodes
                </p>
              </div>
            </div>
          </div>

          <div className='p-6'>
            {/* Network Status */}

            <div className='grid md:grid-cols-2 gap-6 mb-6'>
              {/* Payment Input */}
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-semibold text-text-primary mb-3 flex items-center gap-2'>
                    <DollarSign className='w-4 h-4 text-primary' />
                    Training Budget
                  </label>
                  <div className='relative'>
                    <input
                      type='number'
                      step='0.1'
                      min='0.1'
                      placeholder='e.g., 0.5'
                      className='w-full bg-background border-2 border-border text-text-primary rounded-lg p-4 text-lg font-medium
                               focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                               transition-all duration-200'
                      value={tokenAmount}
                      onChange={(e) => setTokenAmount(e.target.value)}
                    />
                    <div className='absolute right-4 top-1/2 transform -translate-y-1/2'>
                      <span className='bg-primary/10 text-primary px-2 py-1 rounded text-sm font-medium'>
                        HBAR
                      </span>
                    </div>
                  </div>
                  <div className='flex items-center justify-between mt-2 text-sm'>
                    <span className='text-text-secondary'>
                      ≈ ${breakdown.usdValue} USD
                    </span>
                    <span className='text-text-secondary'>
                      Minimum: 0.1 HBAR
                    </span>
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div>
                  <label className='block text-sm font-medium text-text-secondary mb-2'>
                    Quick Select
                  </label>
                  <div className='grid grid-cols-4 gap-2'>
                    {['0.1', '0.5', '1.0', '2.0'].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setTokenAmount(amount)}
                        className={`p-2 rounded-lg border transition-all duration-200 text-sm font-medium ${
                          tokenAmount === amount
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-text-secondary hover:border-primary/50'
                        }`}
                      >
                        {amount}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className='bg-background border border-border rounded-lg p-5'>
                <h4 className='text-lg font-semibold text-text-primary mb-4 flex items-center gap-2'>
                  <Shield className='w-5 h-5 text-primary' />
                  Payment Breakdown
                </h4>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between py-2'>
                    <div className='flex items-center gap-2'>
                      <Users className='w-4 h-4 text-blue-400' />
                      <span className='text-text-secondary'>
                        Trainer Rewards (85%)
                      </span>
                    </div>
                    <span className='font-medium text-text-primary'>
                      {breakdown.trainerRewards} HBAR
                    </span>
                  </div>
                  <div className='flex items-center justify-between py-2'>
                    <div className='flex items-center gap-2'>
                      <Network className='w-4 h-4 text-green-400' />
                      <span className='text-text-secondary'>
                        Network Fees (10%)
                      </span>
                    </div>
                    <span className='font-medium text-text-primary'>
                      {breakdown.networkFees} HBAR
                    </span>
                  </div>
                  <div className='flex items-center justify-between py-2'>
                    <div className='flex items-center gap-2'>
                      <Zap className='w-4 h-4 text-purple-400' />
                      <span className='text-text-secondary'>
                        Platform Fee (5%)
                      </span>
                    </div>
                    <span className='font-medium text-text-primary'>
                      {breakdown.platformFee} HBAR
                    </span>
                  </div>
                  <div className='border-t border-border pt-3 mt-3'>
                    <div className='flex items-center justify-between'>
                      <span className='font-semibold text-text-primary'>
                        Total Payment
                      </span>
                      <div className='text-right'>
                        <div className='text-xl font-bold text-primary'>
                          {tokenAmount || '0'} HBAR
                        </div>
                        <div className='text-sm text-text-secondary'>
                          ≈ ${breakdown.usdValue} USD
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className='bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6'>
              <div className='flex items-start gap-3'>
                <Shield className='w-5 h-5 text-green-400 mt-0.5' />
                <div>
                  <h4 className='text-sm font-medium text-green-400 mb-1'>
                    Secure Payment
                  </h4>
                  <p className='text-sm text-text-secondary'>
                    Your payment will be held in escrow until training
                    completion. Trainers are only rewarded upon successful model
                    delivery.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={!tokenAmount || parseFloat(tokenAmount) < 0.1}
              className='w-full group relative bg-primary text-background font-bold text-lg py-4 px-6 rounded-xl 
                       hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed
                       focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-surface
                       transition-all duration-200 overflow-hidden'
            >
              {/* Animated background */}
              <div
                className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                            translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000'
              ></div>

              <div className='relative flex items-center justify-center'>
                <Coins className='mr-3 h-6 w-6 group-hover:scale-110 transition-transform' />
                <span>Pay {tokenAmount || '0'} HBAR & Initialize Training</span>
              </div>
            </button>

            {/* Additional Info */}
            <div className='mt-4 text-center'>
              <p className='text-xs text-text-secondary'>
                By proceeding, you agree to our training terms.
                <button className='text-primary hover:underline ml-1'>
                  Learn more
                </button>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
