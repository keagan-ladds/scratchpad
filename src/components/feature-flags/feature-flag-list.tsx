'use client';

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

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

export function FeatureFlagList({ initialFlags }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredFlags = initialFlags.filter(flag => 
    flag.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flag.Definitions.some(def => 
      def.ProjectName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Input
          type="text"
          placeholder="Search feature flags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Badge variant="secondary">
          {filteredFlags.length} flags
        </Badge>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="grid gap-4">
          {filteredFlags.map((flag) => (
            <Card key={flag.Name} className="border-muted">
              <CardHeader>
                <CardTitle className="text-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{flag.Name}</span>
                    <Badge variant="outline">
                      {flag.Definitions.length} {flag.Definitions.length === 1 ? 'definition' : 'definitions'}
                    </Badge>
                  </div>
                  <Link href={`/feature-flags/${encodeURIComponent(flag.Name)}`} passHref>
                    <Button variant="ghost" size="sm">
                      View Details
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {flag.Definitions.slice(0, 2).map((def, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">{def.ProjectName}</Badge>
                        <span className="text-sm text-muted-foreground">{def.Location.Path}</span>
                      </div>
                    </div>
                  ))}
                  {flag.Definitions.length > 2 && (
                    <div className="text-sm text-muted-foreground">
                      And {flag.Definitions.length - 2} more definitions...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
