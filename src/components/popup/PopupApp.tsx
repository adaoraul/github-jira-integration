import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Settings, RefreshCw, Github, AlertCircle } from 'lucide-react';
import { Storage, StorageData } from '../../utils/storage';
import { api } from '../../utils/browser-api';

export function PopupApp() {
  const [config, setConfig] = useState<Partial<StorageData>>({});
  const [loading, setLoading] = useState(true);

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

  const openOptions = () => {
    api.runtime.openOptionsPage();
  };

  const refreshPage = () => {
    api.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs[0]?.id) {
        api.tabs.reload(tabs[0].id);
      }
    });
    window.close();
  };

  const openGitHub = () => {
    api.tabs.create({ url: 'https://github.com/adaoraul/github-jira-extension' });
  };

  const openIssues = () => {
    api.tabs.create({ url: 'https://github.com/adaoraul/github-jira-extension/issues' });
  };

  if (loading) {
    return (
      <div className="w-80 p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <RefreshCw className="animate-spin h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-80">
      <Card className="border-0 shadow-none">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <img src="/icons/icon48.png" alt="Extension Icon" className="w-8 h-8" />
            <div>
              <CardTitle className="text-lg">GitHub Jira Integration</CardTitle>
              <CardDescription className="text-xs">
                Enhance your GitHub workflow with Jira
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              {config.jiraUrl ? (
                <Badge variant="default" className="text-xs">
                  Connected
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">
                  Not Configured
                </Badge>
              )}
            </div>

            {config.jiraUrl && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Jira URL</span>
                <span className="text-sm font-medium truncate max-w-[150px]">{config.jiraUrl}</span>
              </div>
            )}
          </div>

          {!config.jiraUrl && (
            <div className="bg-muted/50 rounded-md p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Configure your Jira settings to start using the extension
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Button variant="default" size="sm" onClick={openOptions} className="w-full">
              <Settings className="h-3 w-3" />
              Settings
            </Button>
            <Button variant="outline" size="sm" onClick={refreshPage} className="w-full">
              <RefreshCw className="h-3 w-3" />
              Refresh
            </Button>
          </div>
        </CardContent>

        <CardFooter className="pt-3 pb-4">
          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            <button onClick={openGitHub} className="hover:text-foreground transition-colors">
              <Github className="h-3 w-3 inline mr-1" />
              View on GitHub
            </button>
            <button onClick={openIssues} className="hover:text-foreground transition-colors">
              Report Issue
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
