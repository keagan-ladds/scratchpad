import fs from 'fs';
import path from 'path';
import { FeatureFlagList } from '@/components/feature-flags/feature-flag-list';

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

async function getFeatureFlags() {
  const featureFlagsDir = path.join(process.cwd(), 'public', 'docs', 'feature-flags');
  const files = fs.readdirSync(featureFlagsDir);
  
  // Create a map to store combined flags
  const flagsMap = new Map<string, FeatureFlag>();
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      const filePath = path.join(featureFlagsDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const flags: FeatureFlag[] = JSON.parse(fileContent);
      
      // Combine flags with the same name
      flags.forEach(flag => {
        if (flagsMap.has(flag.Name)) {
          const existingFlag = flagsMap.get(flag.Name)!;
          existingFlag.Definitions.push(...flag.Definitions);
        } else {
          flagsMap.set(flag.Name, flag);
        }
      });
    }
  }

  // Convert map back to array
  return Array.from(flagsMap.values());
}

export default async function FeatureFlags() {
  const featureFlags = await getFeatureFlags();

  return (
    <div className="container p-6 mx-auto max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Feature Flags</h1>
      </div>
      <FeatureFlagList initialFlags={featureFlags} />
    </div>
  );
}
