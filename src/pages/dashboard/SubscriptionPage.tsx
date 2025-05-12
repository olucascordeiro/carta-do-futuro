import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import PricingCard from '../../components/subscription/PricingCard';
import { CreditCard, Award, Clock, AlertCircle } from 'lucide-react';

const SubscriptionPage: React.FC = () => {
  const { authState } = useAuth();
  const isSubscriber = authState.user?.isSubscriber || false;
  
  const freeFeatures = [
    { text: 'Up to 3 scheduled letters', included: true },
    { text: 'Basic text editor', included: true },
    { text: 'Schedule up to 3 months ahead', included: true },
    { text: 'Email delivery', included: true },
    { text: 'Media attachments', included: false },
    { text: 'Premium templates', included: false },
    { text: 'Schedule up to 1 year ahead', included: false },
    { text: 'Unlimited letters', included: false },
  ];
  
  const premiumFeatures = [
    { text: 'Unlimited scheduled letters', included: true },
    { text: 'Advanced text editor', included: true },
    { text: 'Schedule up to 1 year ahead', included: true },
    { text: 'Email delivery', included: true },
    { text: 'Media attachments (photos/videos)', included: true },
    { text: 'Premium templates', included: true },
    { text: 'Priority support', included: true },
    { text: 'Export all your letters', included: true },
  ];
  
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-serif mb-2">Subscription</h1>
        <p className="text-text-secondary">
          Manage your subscription plan
        </p>
      </div>
      
      {isSubscriber ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <div className="flex items-center mb-6">
                <Award className="text-accent-gold mr-3" size={28} />
                <h2 className="text-xl font-serif">Current Subscription</h2>
              </div>
              
              <div className="bg-background-dark p-4 rounded-md mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-primary font-medium">Premium Plan</span>
                    <p className="text-text-secondary text-sm">$4.99/month</p>
                  </div>
                  <div className="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-sm">
                    Active
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-text-secondary text-sm mb-1">Next Billing Date</h3>
                  <div className="flex items-center">
                    <Clock className="text-primary mr-2" size={16} />
                    <p>July 15, 2023</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-text-secondary text-sm mb-1">Payment Method</h3>
                  <div className="flex items-center">
                    <CreditCard className="text-primary mr-2" size={16} />
                    <p>•••• •••• •••• 4242</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline">
                  Update Payment Method
                </Button>
                <Button variant="outline" className="text-red-400 hover:text-red-500 hover:border-red-500">
                  Cancel Subscription
                </Button>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center mb-6">
                <AlertCircle className="text-accent-lavender mr-3" size={28} />
                <h2 className="text-xl font-serif">Billing History</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-primary/10">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                        Invoice
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/10">
                    <tr>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        Jun 15, 2023
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        $4.99
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-500">
                          Paid
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <a href="#" className="text-primary hover:underline">
                          View
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        May 15, 2023
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        $4.99
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-500">
                          Paid
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <a href="#" className="text-primary hover:underline">
                          View
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
          
          <div>
            <Card className="bg-background-dark">
              <h2 className="text-xl font-serif mb-6">Premium Benefits</h2>
              
              <ul className="space-y-3">
                {premiumFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="text-primary mt-0.5 mr-2">
                      <Check size={18} />
                    </div>
                    <span className="text-text-secondary">
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      ) : (
        <div>
          <Card className="mb-8">
            <div className="flex items-center mb-6">
              <Award className="text-accent-gold mr-3" size={28} />
              <h2 className="text-xl font-serif">Current Plan: Free</h2>
            </div>
            
            <p className="text-text-secondary mb-6">
              You're currently on the free plan with limited features. 
              Upgrade to Premium to unlock all features and benefits.
            </p>
          </Card>
          
          <h2 className="text-2xl font-serif mb-6 text-center">Choose Your Plan</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <PricingCard
              title="Free"
              price="Free"
              features={freeFeatures}
              buttonText="Current Plan"
              onClick={() => {}}
            />
            
            <PricingCard
              title="Premium"
              price="$4.99"
              features={premiumFeatures}
              isPopular={true}
              buttonText="Upgrade Now"
              onClick={() => {}}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SubscriptionPage;