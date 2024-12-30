import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Suspense } from 'react';

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

async function getFeatureFlag(name: string): Promise<FeatureFlag | null> {
  const featureFlagsDir = path.join(process.cwd(), 'public', 'docs', 'feature-flags');
  const files = fs.readdirSync(featureFlagsDir);
  
  let combinedFlag: FeatureFlag | null = null;
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      const filePath = path.join(featureFlagsDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const flags: FeatureFlag[] = JSON.parse(fileContent);
      
      const flag = flags.find(f => f.Name === name);
      if (flag) {
        if (!combinedFlag) {
          combinedFlag = { ...flag };
        } else {
          combinedFlag.Definitions.push(...flag.Definitions);
        }
      }
    }
  }

  return combinedFlag;
}

export default async function FeatureFlagPage({ params }: { params: { name: string } }) {
  const featureFlag = await getFeatureFlag(params.name);

  if (!featureFlag) {
    notFound();
  }

  // Group definitions and references by project
  const projectGroups = featureFlag.Definitions.reduce((acc, def) => {
    if (!acc[def.ProjectName]) {
      acc[def.ProjectName] = {
        definitions: [],
        references: []
      };
    }
    acc[def.ProjectName].definitions.push(def);
    acc[def.ProjectName].references.push(...def.References);
    return acc;
  }, {} as Record<string, { 
    definitions: typeof featureFlag.Definitions, 
    references: typeof featureFlag.Definitions[0]['References']
  }>);

  return (
    <div className="container p-6 mx-auto max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{featureFlag.Name}</h1>
          <div className="flex gap-2">
            <Badge variant="outline">
              {featureFlag.Definitions.length} {featureFlag.Definitions.length === 1 ? 'definition' : 'definitions'}
            </Badge>
            <Badge variant="outline">
              {Object.keys(projectGroups).length} {Object.keys(projectGroups).length === 1 ? 'project' : 'projects'}
            </Badge>
            <Badge variant="outline">
              {Object.values(projectGroups).reduce((acc, group) => acc + group.references.length, 0)} references
            </Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="byProject" className="space-y-4">
        <TabsList>
          <TabsTrigger value="byProject">By Project</TabsTrigger>
          <TabsTrigger value="allReferences">All References</TabsTrigger>
        </TabsList>

        <TabsContent value="byProject" className="space-y-4">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            {Object.entries(projectGroups).map(([projectName, group]) => (
              <Card key={projectName} className="mb-4">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-lg">{projectName}</Badge>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          {group.definitions.length} {group.definitions.length === 1 ? 'definition' : 'definitions'}
                        </Badge>
                        <Badge variant="outline">
                          {group.references.length} {group.references.length === 1 ? 'reference' : 'references'}
                        </Badge>
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {group.definitions.map((def, index) => (
                      <div key={index} className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">Definition {index + 1}</h3>
                            <Badge variant="secondary">{def.Method.MethodName}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Location: {def.Location.Path}
                          </p>
                          {def.Method.Preview && (
                            <pre className="mt-2 p-3 bg-muted rounded-md overflow-x-auto">
                              <code className="text-sm text-foreground whitespace-pre">
                                {def.Method.Preview}
                              </code>
                            </pre>
                          )}
                        </div>

                        {def.References.length > 0 && (
                          <div className="pl-4 border-l-2 border-muted">
                            <h4 className="text-sm font-medium mb-2">References</h4>
                            <div className="space-y-2">
                              {def.References.map((ref, refIndex) => (
                                <div key={refIndex} className="p-3 bg-muted/50 rounded-lg">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium">{ref.FileName}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{ref.Location.Path}</p>
                                  {ref.Preview && (
                                    <pre className="mt-2 p-3 bg-muted rounded-md overflow-x-auto">
                                      <code className="text-sm text-foreground whitespace-pre">
                                        {ref.Preview}
                                      </code>
                                    </pre>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="allReferences" className="space-y-4">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="grid gap-4">
              {Object.entries(projectGroups).map(([projectName, group]) => (
                <div key={projectName}>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="default">{projectName}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {group.references.length} {group.references.length === 1 ? 'reference' : 'references'}
                    </span>
                  </div>
                  <div className="grid gap-2">
                    {group.references.map((ref, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{ref.FileName}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{ref.Location.Path}</p>
                          {ref.Preview && (
                            <pre className="mt-2 p-3 bg-muted rounded-md overflow-x-auto">
                              <code className="text-sm text-foreground whitespace-pre">
                                {ref.Preview}
                              </code>
                            </pre>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
