'use client';

import { useState } from 'react';

interface FeatureFlag {
  Name: string;
  Definitions: {
    ProjectName: string;
    Location: {
      Path: string;
    };
    Method: {
      MethodName: string;
      Location: {
        Path: string;
      };
      Preview: string;
    };
    References: {
      FileName: string;
      Location: {
        Path: string;
      };
      Preview: string;
    }[];
  }[];
}

interface Props {
  initialFlags: FeatureFlag[];
}

export default function FeatureFlagList({ initialFlags }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredFlags = initialFlags.filter(flag => 
    flag.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flag.Definitions.some(def => 
      def.ProjectName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search feature flags..."
          className="w-full p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filteredFlags.map((flag) => (
          <div key={flag.Name} className="border rounded p-4">
            <h2 className="text-xl font-semibold mb-2">{flag.Name}</h2>
            {flag.Definitions.map((def, index) => (
              <div key={index} className="ml-4 mb-2">
                <p className="font-medium">Project: {def.ProjectName}</p>
                <p className="text-sm">Path: {def.Location.Path}</p>
                <p className="text-sm">Method: {def.Method.MethodName}</p>
                {def.References.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">References:</p>
                    <ul className="list-disc ml-4">
                      {def.References.map((ref, refIndex) => (
                        <li key={refIndex} className="text-sm">
                          {ref.FileName} - {ref.Location.Path}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
