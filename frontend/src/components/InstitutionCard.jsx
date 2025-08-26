import { useState } from "react";
import { Building, FileText, MapPin } from "lucide-react";
import DocumentRequestForm from "./DocumentRequestForm";

const InstitutionCard = ({ institution, onRequestSuccess }) => {
  const [showRequestForm, setShowRequestForm] = useState(false);

  return (
    <>
      <div className="card bg-base-100 border border-base-300 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <Building className="h-10 w-10 text-primary" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-base-content">
                {institution.name}
              </h3>
              {institution.eiin && (
                <p className="text-sm text-base-content/60">
                  EIIN: {institution.eiin}
                </p>
              )}
            </div>
          </div>
        </div>

        {institution.address && (
          <div className="flex items-center text-sm text-base-content/60 mb-3">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{institution.address}</span>
          </div>
        )}

        {institution.description && (
          <p className="text-base-content/70 text-sm mb-4 line-clamp-2">
            {institution.description}
          </p>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-base-300">
          <div className="text-sm text-base-content/60">
            {institution.email && <span>{institution.email}</span>}
          </div>
          <button
            onClick={() => setShowRequestForm(true)}
            className="btn btn-primary btn-sm"
          >
            <FileText className="h-4 w-4 mr-2" />
            Request Document
          </button>
        </div>
      </div>

      <DocumentRequestForm
        institution={institution}
        isOpen={showRequestForm}
        onClose={() => setShowRequestForm(false)}
        onSuccess={onRequestSuccess}
      />
    </>
  );
};

export default InstitutionCard;
