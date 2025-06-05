'use client';

import { X, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { Contract } from '@/types/contract';

interface ContractModalProps {
  contract: Contract;
  onClose: () => void;
}

export default function ContractModal({ contract, onClose }: ContractModalProps) {
  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
          onClick={onClose}
          aria-hidden="true"
        />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full relative">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {contract.title || 'Contract Details'}
              </h3>
              <button
                onClick={onClose}
                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Summary Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Agency:</span>
                    <p className="font-medium">{contract.department_agency || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Contract Type:</span>
                    <p className="font-medium">{contract.type || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Notice ID:</span>
                    <p className="font-medium">{contract.notice_id || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Solicitation #:</span>
                    <p className="font-medium">{contract.solicitation_number || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Set Aside:</span>
                    <p className="font-medium">{contract.set_aside || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Award Amount:</span>
                    <p className="font-medium">{formatCurrency(contract.award_amount)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Posted Date:</span>
                    <p className="font-medium">
                      {contract.posted_date
                        ? format(new Date(contract.posted_date), 'MM/dd/yyyy')
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Due Date:</span>
                    <p className="font-medium">
                      {contract.response_deadline
                        ? format(new Date(contract.response_deadline), 'MM/dd/yyyy')
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">NAICS Code:</span>
                    <p className="font-medium">{contract.naics_code || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <p className="font-medium">
                      {contract.city && contract.state 
                        ? `${contract.city}, ${contract.state}` 
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Description</h4>
                <p className="text-sm text-gray-600">
                  {contract.description || 'No description available'}
                </p>
              </div>

              {/* Vendor Information (if awarded) */}
              {contract.awardee && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Vendor Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="col-span-2">
                      <span className="text-gray-500">Company:</span>
                      <p className="font-medium">{contract.awardee}</p>
                    </div>
                    {contract.award_date && (
                      <div>
                        <span className="text-gray-500">Award Date:</span>
                        <p className="font-medium">
                          {format(new Date(contract.award_date), 'MM/dd/yyyy')}
                        </p>
                      </div>
                    )}
                    {contract.award_number && (
                      <div>
                        <span className="text-gray-500">Award Number:</span>
                        <p className="font-medium">{contract.award_number}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contracting Office Details */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Contracting Office Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Contracting Agency:</span>
                    <p className="font-medium">{contract.department_agency || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Sub-Tier:</span>
                    <p className="font-medium">{contract.sub_tier || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Office:</span>
                    <p className="font-medium">{contract.office || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <p className="font-medium">
                      {contract.pop_city && contract.pop_state
                        ? `${contract.pop_city}, ${contract.pop_state}`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <a
              href={contract.link || `https://sam.gov/opp/${contract.notice_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on SAM.gov
            </a>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}