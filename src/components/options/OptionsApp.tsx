import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Save, RotateCcw, Github, AlertCircle, CheckCircle } from 'lucide-react';
import { Storage, StorageData } from '../../utils/storage';
import { DEFAULT_PR_TEMPLATE } from '../../templates/pr-template';

export function OptionsApp() {
  const [config, setConfig] = useState<StorageData>({
    jiraUrl: '',
    jiraEmail: '',
    jiraApiToken: '',
    acceptanceStartString: 'h3. Acceptance Criteria',
    acceptanceEndString: 'h3. Notes',
    prTemplateEnabled: true,
    prTitleEnabled: true,
    prTemplate: DEFAULT_PR_TEMPLATE,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await Storage.getAll();
      setConfig(data);
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');

    try {
      await Storage.set(config);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to save config:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setConfig({
      jiraUrl: '',
      jiraEmail: '',
      jiraApiToken: '',
      acceptanceStartString: 'h3. Acceptance Criteria',
      acceptanceEndString: 'h3. Notes',
      prTemplateEnabled: true,
      prTitleEnabled: true,
      prTemplate: DEFAULT_PR_TEMPLATE,
    });
  };

  const updateConfig = <K extends keyof StorageData>(key: K, value: StorageData[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl p-3 sm:p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <RotateCcw className="animate-spin h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-3 sm:p-6">
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src="/icons/icon48.png"
                alt="Extension Icon"
                className="w-8 h-8 sm:w-10 sm:h-10 shrink-0"
              />
              <div className="min-w-0">
                <CardTitle className="text-lg sm:text-xl">
                  GitHub Jira Integration Settings
                </CardTitle>
                <CardDescription className="text-sm">
                  Configure your Jira connection and PR template preferences
                </CardDescription>
              </div>
            </div>
            {config.jiraUrl && (
              <Badge variant="default" className="self-start sm:self-auto">
                Connected
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <Tabs defaultValue="connection" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="connection" className="text-xs sm:text-sm">
                Connection
              </TabsTrigger>
              <TabsTrigger value="template" className="text-xs sm:text-sm">
                PR Template
              </TabsTrigger>
              <TabsTrigger value="advanced" className="text-xs sm:text-sm">
                Advanced
              </TabsTrigger>
            </TabsList>

            <TabsContent value="connection" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jiraUrl">Jira URL</Label>
                <Input
                  id="jiraUrl"
                  placeholder="company.atlassian.net"
                  value={config.jiraUrl}
                  onChange={(e) => updateConfig('jiraUrl', e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Enter your Jira domain without the protocol (https://)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jiraEmail">Jira Email</Label>
                <Input
                  id="jiraEmail"
                  type="email"
                  placeholder="your-email@company.com"
                  value={config.jiraEmail}
                  onChange={(e) => updateConfig('jiraEmail', e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Your Jira account email (required for Firefox)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jiraApiToken">API Token</Label>
                <Input
                  id="jiraApiToken"
                  type="password"
                  placeholder="Your Jira API token"
                  value={config.jiraApiToken}
                  onChange={(e) => updateConfig('jiraApiToken', e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Required for Firefox.{' '}
                  <a
                    href="https://id.atlassian.com/manage-profile/security/api-tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Create API token here
                  </a>
                </p>
              </div>
            </TabsContent>

            <TabsContent value="template" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="prTitleEnabled">Auto-set PR Title</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically set PR title from Jira ticket
                  </p>
                </div>
                <Switch
                  id="prTitleEnabled"
                  checked={config.prTitleEnabled}
                  onCheckedChange={(checked) => updateConfig('prTitleEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="prTemplateEnabled">Auto-fill PR Description</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically fill PR description with template
                  </p>
                </div>
                <Switch
                  id="prTemplateEnabled"
                  checked={config.prTemplateEnabled}
                  onCheckedChange={(checked) => updateConfig('prTemplateEnabled', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prTemplate">PR Description Template</Label>
                <Textarea
                  id="prTemplate"
                  rows={10}
                  value={config.prTemplate}
                  onChange={(e) => updateConfig('prTemplate', e.target.value)}
                  className="font-mono text-xs sm:text-sm min-h-[200px] resize-y"
                />
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Available variables: {'{{TICKETNUMBER}}'}, {'{{TICKETURL}}'}, {'{{ACCEPTANCE}}'}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="acceptanceStartString">Acceptance Criteria Start String</Label>
                <Input
                  id="acceptanceStartString"
                  value={config.acceptanceStartString}
                  onChange={(e) => updateConfig('acceptanceStartString', e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Text that marks the beginning of acceptance criteria in Jira
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="acceptanceEndString">Acceptance Criteria End String</Label>
                <Input
                  id="acceptanceEndString"
                  value={config.acceptanceEndString}
                  onChange={(e) => updateConfig('acceptanceEndString', e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Text that marks the end of acceptance criteria in Jira
                </p>
              </div>

              <div className="bg-muted/50 rounded-md p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-1">About Acceptance Criteria Extraction</p>
                    <p>
                      The extension extracts text between the start and end strings from your Jira
                      tickets. This extracted content is inserted into your PR template where{' '}
                      {'{{ACCEPTANCE}}'} appears.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleSave} disabled={saving} size="sm" className="text-sm">
              {saving ? (
                <>
                  <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                  Save Settings
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleReset} size="sm" className="text-sm">
              <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Reset to Defaults</span>
              <span className="sm:hidden">Reset</span>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            {saveStatus === 'success' && (
              <div className="flex items-center gap-1 text-xs sm:text-sm text-green-600">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                Settings saved!
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center gap-1 text-xs sm:text-sm text-destructive">
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                Failed to save
              </div>
            )}

            <a
              href="https://github.com/adaoraul/github-jira-extension"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
              <span className="hidden sm:inline">View on GitHub</span>
              <span className="sm:hidden">GitHub</span>
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
