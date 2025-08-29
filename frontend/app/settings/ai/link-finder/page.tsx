"use client";

import React, { createContext, useContext, useReducer, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Search, 
  Sparkles, 
  Clock,
  FileText,
  Video,
  FileIcon,
  GitBranch,
  Database,
  ThumbsUp,
  ThumbsDown,
  Info,
  Plus,
  RotateCcw,
  Save,
  AlertCircle,
  Loader2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Settings,
  Target,
  Globe,
  Zap,
  BookOpen,
  Eye,
  Heart
} from 'lucide-react';
import { supabase } from '@/lib/supabase'
import { getAISetting, saveAISetting } from '@/lib/user-settings-service'

// Types
type LinkType = 'article' | 'video' | 'pdf' | 'repo' | 'dataset';

interface LinkFinderPrefs {
  topic: string;
  useProfileInterests: boolean;
  dateRange: 'any' | '24h' | 'week' | 'month' | 'year';
  linkTypes: LinkType[];
  language: 'detect' | 'en' | 'es' | 'fr' | 'de' | 'zh';
  includeDomains: string[];
  excludeDomains: string[];
  maxLinks: 10 | 25 | 50 | 75 | 100;
  serendipity: number;
  autoSaveAll: boolean;
  schedule: 'off' | 'daily' | 'weekly';
}

interface FinderResult {
  url: string;
  title: string;
  summary: string;
  favicon: string;
  linkType: LinkType;
  why: string[];
  readTime?: string;
  selected: boolean;
  id: string;
  confidence?: number;
  domain?: string;
}

// Default preferences
const defaultPrefs: LinkFinderPrefs = {
  topic: '',
  useProfileInterests: true,
  dateRange: 'any',
  linkTypes: ['article'],
  language: 'detect',
  includeDomains: [],
  excludeDomains: [],
  maxLinks: 25,
  serendipity: 3,
  autoSaveAll: false,
  schedule: 'off'
};

// Context
interface LinkFinderState {
  prefs: LinkFinderPrefs;
  results: FinderResult[];
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  selectedResults: Set<string>;
  searchProgress: number;
  currentSearchStep: string;
}

type LinkFinderAction = 
  | { type: 'SET_PREFS'; payload: Partial<LinkFinderPrefs> }
  | { type: 'SET_RESULTS'; payload: FinderResult[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_UNSAVED_CHANGES'; payload: boolean }
  | { type: 'TOGGLE_RESULT_SELECTION'; payload: string }
  | { type: 'SELECT_ALL_RESULTS'; payload: boolean }
  | { type: 'UPDATE_RESULT_FEEDBACK'; payload: { id: string; feedback: 'up' | 'down' } }
  | { type: 'SET_SEARCH_PROGRESS'; payload: { progress: number; step: string } }
  | { type: 'RESET_TO_DEFAULTS' };

const LinkFinderContext = createContext<{
  state: LinkFinderState;
  dispatch: React.Dispatch<LinkFinderAction>;
} | null>(null);

// Helper functions
const generateId = () => Math.random().toString(36).substr(2, 9);

const whyThisLink = (prefs: LinkFinderPrefs): string[] => {
  const reasons: string[] = [];
  
  if (prefs.topic) {
    reasons.push(`Matches topic: "${prefs.topic}"`);
  }
  
  if (prefs.linkTypes.length > 0) {
    reasons.push(`Preferred content type: ${prefs.linkTypes[0]}`);
  }
  
  if (prefs.useProfileInterests) {
    reasons.push('Aligns with your profile interests');
  }
  
  return reasons.slice(0, 3);
};

// Mock API hook
const useFinderAPI = (prefs: LinkFinderPrefs) => {
  const [results, setResults] = useState<FinderResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const findLinks = async (dispatch: React.Dispatch<LinkFinderAction>) => {
    if (!prefs.topic.trim()) {
      toast.error('Please enter a topic to search for');
      return;
    }

    setIsLoading(true);
    dispatch({ type: 'SET_LOADING', payload: true });

    // Simulate search progress
    const steps = [
      { progress: 20, step: 'Analyzing search query...' },
      { progress: 40, step: 'Searching web sources...' },
      { progress: 60, step: 'Filtering by preferences...' },
      { progress: 80, step: 'Ranking results...' },
      { progress: 100, step: 'Complete!' }
    ];

    for (const step of steps) {
      dispatch({ type: 'SET_SEARCH_PROGRESS', payload: step });
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Mock results based on preferences
    const mockResults: FinderResult[] = [
      {
        id: generateId(),
        url: 'https://example.com/ai-trends-2024',
        title: 'The Future of AI: Trends and Predictions for 2024',
        summary: 'Comprehensive analysis of emerging AI technologies and their potential impact on various industries.',
        favicon: '🤖',
        linkType: 'article' as LinkType,
        why: whyThisLink(prefs),
        readTime: '8 min',
        selected: false,
        confidence: 95,
        domain: 'example.com'
      },
      {
        id: generateId(),
        url: 'https://youtube.com/watch?v=ai-demo',
        title: 'Building AI Applications: Complete Tutorial',
        summary: 'Step-by-step video guide for creating AI-powered applications from scratch.',
        favicon: '📺',
        linkType: 'video' as LinkType,
        why: whyThisLink(prefs),
        readTime: '45 min',
        selected: false,
        confidence: 88,
        domain: 'youtube.com'
      },
      {
        id: generateId(),
        url: 'https://arxiv.org/abs/2024.ai.paper',
        title: 'Advanced Neural Networks Research Paper',
        summary: 'Latest research findings on neural network architectures and optimization techniques.',
        favicon: '📄',
        linkType: 'pdf' as LinkType,
        why: whyThisLink(prefs),
        selected: false,
        confidence: 92,
        domain: 'arxiv.org'
      },
      {
        id: generateId(),
        url: 'https://github.com/ai-project/awesome-ai',
        title: 'Awesome AI Resources Repository',
        summary: 'Curated collection of AI tools, libraries, and educational resources.',
        favicon: '⚡',
        linkType: 'repo' as LinkType,
        why: whyThisLink(prefs),
        selected: false,
        confidence: 85,
        domain: 'github.com'
      },
      {
        id: generateId(),
        url: 'https://kaggle.com/datasets/ai-dataset',
        title: 'Machine Learning Dataset Collection',
        summary: 'Large-scale dataset for training machine learning models across various domains.',
        favicon: '📊',
        linkType: 'dataset' as LinkType,
        why: whyThisLink(prefs),
        selected: false,
        confidence: 90,
        domain: 'kaggle.com'
      }
    ].slice(0, Math.min(prefs.maxLinks, 5));

    // Filter by link types
    const filteredResults = mockResults.filter(result => 
      prefs.linkTypes.length === 0 || prefs.linkTypes.includes(result.linkType)
    );

    setResults(filteredResults);
    setIsLoading(false);
    dispatch({ type: 'SET_LOADING', payload: false });
    dispatch({ type: 'SET_RESULTS', payload: filteredResults });

    if (prefs.autoSaveAll && filteredResults.length > 0) {
      toast.success(`✓ ${filteredResults.length} new bookmarks added to Inbox`, {
        action: {
          label: 'Undo',
          onClick: () => toast.info('Bookmarks removed')
        },
        duration: 8000
      });
    }
  };

  return { results, isLoading, findLinks };
};

// Reducer
const linkFinderReducer = (state: LinkFinderState, action: LinkFinderAction): LinkFinderState => {
  switch (action.type) {
    case 'SET_PREFS':
      return {
        ...state,
        prefs: { ...state.prefs, ...action.payload },
        hasUnsavedChanges: true
      };
    
    case 'SET_RESULTS':
      return {
        ...state,
        results: action.payload,
        selectedResults: new Set()
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    
    case 'SET_UNSAVED_CHANGES':
      return {
        ...state,
        hasUnsavedChanges: action.payload
      };
    
    case 'TOGGLE_RESULT_SELECTION':
      const newSelectedResults = new Set(state.selectedResults);
      if (newSelectedResults.has(action.payload)) {
        newSelectedResults.delete(action.payload);
      } else {
        newSelectedResults.add(action.payload);
      }
      return {
        ...state,
        selectedResults: newSelectedResults,
        results: state.results.map(result => ({
          ...result,
          selected: result.id === action.payload ? !result.selected : result.selected
        }))
      };
    
    case 'SELECT_ALL_RESULTS':
      return {
        ...state,
        selectedResults: action.payload ? new Set(state.results.map(r => r.id)) : new Set(),
        results: state.results.map(result => ({ ...result, selected: action.payload }))
      };
    
    case 'UPDATE_RESULT_FEEDBACK':
      return {
        ...state,
        results: state.results.map(result => 
          result.id === action.payload.id 
            ? { ...result, feedback: action.payload.feedback }
            : result
        )
      };

    case 'SET_SEARCH_PROGRESS':
      return {
        ...state,
        searchProgress: action.payload.progress,
        currentSearchStep: action.payload.step
      };
    
    case 'RESET_TO_DEFAULTS':
      return {
        ...state,
        prefs: defaultPrefs,
        hasUnsavedChanges: false
      };
    
    default:
      return state;
  }
};

// Custom hook
const useLinkFinder = () => {
  const context = useContext(LinkFinderContext);
  if (!context) {
    throw new Error('useLinkFinder must be used within LinkFinderProvider');
  }
  return context;
};

// Components
const UnsavedChangesBar: React.FC = () => {
  const { state, dispatch } = useLinkFinder();

  if (!state.hasUnsavedChanges) return null;

  const handleReset = () => {
    dispatch({ type: 'RESET_TO_DEFAULTS' });
    toast.success('Settings reset to defaults');
  };

  const handleSave = () => {
    localStorage.setItem('linkFinderPrefs', JSON.stringify(state.prefs));
    dispatch({ type: 'SET_UNSAVED_CHANGES', payload: false });
    toast.success('Settings saved successfully');
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-6 shadow-sm" role="alert" aria-live="polite">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-amber-500 mr-3" />
          <div>
            <span className="text-sm font-semibold text-amber-800">
              Unsaved Changes
            </span>
            <p className="text-xs text-amber-700 mt-1">
              Your search preferences have been modified
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset}
            className="text-amber-800 border-amber-300 hover:bg-amber-100"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <Button 
            size="sm" 
            onClick={handleSave}
            className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
          >
            <Save className="h-4 w-4 mr-1" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

const SearchProgress: React.FC = () => {
  const { state } = useLinkFinder();

  if (!state.isLoading) return null;

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50/50">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="font-medium text-blue-900">
            {state.currentSearchStep}
          </span>
        </div>
        <Progress value={state.searchProgress} className="h-2" />
        <div className="flex justify-between text-xs text-blue-700 mt-2">
          <span>Searching...</span>
          <span>{state.searchProgress}%</span>
        </div>
      </CardContent>
    </Card>
  );
};

const LinkTypeChip: React.FC<{ 
  type: LinkType; 
  selected: boolean; 
  onToggle: (type: LinkType) => void;
}> = ({ type, selected, onToggle }) => {
  const getTypeConfig = (linkType: LinkType) => {
    switch (linkType) {
      case 'article':
        return { icon: FileText, label: 'Article', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'video':
        return { icon: Video, label: 'Video', color: 'bg-red-100 text-red-800 border-red-200' };
      case 'pdf':
        return { icon: FileIcon, label: 'PDF', color: 'bg-orange-100 text-orange-800 border-orange-200' };
      case 'repo':
        return { icon: GitBranch, label: 'Repository', color: 'bg-green-100 text-green-800 border-green-200' };
      case 'dataset':
        return { icon: Database, label: 'Dataset', color: 'bg-purple-100 text-purple-800 border-purple-200' };
    }
  };

  const config = getTypeConfig(type);
  const Icon = config.icon;

  return (
    <Badge
      variant={selected ? "default" : "outline"}
      className={`cursor-pointer transition-all hover:scale-105 ${
        selected 
          ? `${config.color} shadow-sm` 
          : 'hover:bg-muted border-2 hover:border-primary/20'
      }`}
      onClick={() => onToggle(type)}
    >
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
};

const SerendipitySlider: React.FC<{ 
  value: number; 
  onChange: (value: number) => void;
}> = ({ value, onChange }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="font-medium">Serendipity</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground hover:text-primary cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Focus ←→ Explore: Higher values include more diverse results</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Slider
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        max={10}
        min={0}
        step={1}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span className="flex items-center">
          <Target className="h-3 w-3 mr-1" />
          Focus
        </span>
        <Badge variant="outline" className="text-xs">
          {value}
        </Badge>
        <span className="flex items-center">
          <Sparkles className="h-3 w-3 mr-1" />
          Explore
        </span>
      </div>
    </div>
  );
};

const CollapsibleSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-between p-0 h-auto hover:bg-transparent"
        >
          <div className="flex items-center space-x-2">
            {icon}
            <span className="font-medium">{title}</span>
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4 space-y-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

const QueryBuilder: React.FC = () => {
  const { state, dispatch } = useLinkFinder();
  const { findLinks } = useFinderAPI(state.prefs);

  const handlePrefsChange = <K extends keyof LinkFinderPrefs>(key: K, value: LinkFinderPrefs[K]) => {
    dispatch({ type: 'SET_PREFS', payload: { [key]: value } });
  };

  const handleLinkTypeToggle = (type: LinkType) => {
    const newTypes = state.prefs.linkTypes.includes(type)
      ? state.prefs.linkTypes.filter(t => t !== type)
      : [...state.prefs.linkTypes, type];
    handlePrefsChange('linkTypes', newTypes);
  };

  const handleDomainsChange = (key: 'includeDomains' | 'excludeDomains', value: string) => {
    const domains = value.split(',').map(d => d.trim()).filter(Boolean);
    handlePrefsChange(key, domains);
  };

  const handleFindLinks = async () => {
    await findLinks(dispatch);
  };

  return (
    <Card className="h-fit sticky top-6">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg">
          <Search className="h-5 w-5 mr-2 text-primary" />
          Query Builder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Search */}
        <div className="space-y-3">
          <Label htmlFor="topic" className="text-sm font-medium">Topic / Keywords</Label>
          <Input
            id="topic"
            placeholder="e.g., artificial intelligence, web development"
            value={state.prefs.topic}
            onChange={(e) => handlePrefsChange('topic', e.target.value)}
            className="text-sm"
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <Label htmlFor="profile-interests" className="text-sm">Use my profile interests</Label>
            </div>
            <Switch
              id="profile-interests"
              checked={state.prefs.useProfileInterests}
              onCheckedChange={(checked) => handlePrefsChange('useProfileInterests', checked)}
            />
          </div>
        </div>

        <Separator />

        {/* Content Filters */}
        <CollapsibleSection 
          title="Content Filters" 
          icon={<Filter className="h-4 w-4 text-blue-500" />}
          defaultOpen={true}
        >
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Date Range</Label>
              <Select value={state.prefs.dateRange} onValueChange={(value) => handlePrefsChange('dateRange', value)}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any time</SelectItem>
                  <SelectItem value="24h">Past 24 hours</SelectItem>
                  <SelectItem value="week">Past week</SelectItem>
                  <SelectItem value="month">Past month</SelectItem>
                  <SelectItem value="year">Past year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Link Types</Label>
              <div className="flex flex-wrap gap-2">
                {(['article', 'video', 'pdf', 'repo', 'dataset'] as LinkType[]).map(type => (
                  <LinkTypeChip
                    key={type}
                    type={type}
                    selected={state.prefs.linkTypes.includes(type)}
                    onToggle={handleLinkTypeToggle}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Language</Label>
              <Select value={state.prefs.language} onValueChange={(value) => handlePrefsChange('language', value)}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="detect">Auto-detect</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleSection>

        <Separator />

        {/* Advanced Settings */}
        <CollapsibleSection 
          title="Advanced Settings" 
          icon={<Settings className="h-4 w-4 text-gray-500" />}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="include-domains" className="text-sm font-medium">Include domains</Label>
              <Textarea
                id="include-domains"
                placeholder="github.com, stackoverflow.com"
                value={state.prefs.includeDomains.join(', ')}
                onChange={(e) => handleDomainsChange('includeDomains', e.target.value)}
                className="mt-2 text-sm"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="exclude-domains" className="text-sm font-medium">Exclude domains</Label>
              <Textarea
                id="exclude-domains"
                placeholder="spam-site.com, ads-domain.com"
                value={state.prefs.excludeDomains.join(', ')}
                onChange={(e) => handleDomainsChange('excludeDomains', e.target.value)}
                className="mt-2 text-sm"
                rows={2}
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">
                Max links per run: {state.prefs.maxLinks}
              </Label>
              <Slider
                value={[state.prefs.maxLinks]}
                onValueChange={(values) => handlePrefsChange('maxLinks', values[0])}
                max={100}
                min={10}
                step={15}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>10</span>
                <span>100</span>
              </div>
            </div>

            <SerendipitySlider
              value={state.prefs.serendipity}
              onChange={(value) => handlePrefsChange('serendipity', value)}
            />
          </div>
        </CollapsibleSection>

        <Separator />

        {/* Automation */}
        <CollapsibleSection 
          title="Automation" 
          icon={<Zap className="h-4 w-4 text-orange-500" />}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Plus className="h-4 w-4 text-green-500" />
                <Label htmlFor="auto-save" className="text-sm">Auto-save everything found</Label>
              </div>
              <Switch
                id="auto-save"
                checked={state.prefs.autoSaveAll}
                onCheckedChange={(checked) => handlePrefsChange('autoSaveAll', checked)}
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Schedule</Label>
              <Select value={state.prefs.schedule} onValueChange={(value) => handlePrefsChange('schedule', value)}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Off</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleSection>

        <Button 
          onClick={handleFindLinks} 
          disabled={state.isLoading || !state.prefs.topic.trim()}
          size="lg"
          className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
        >
          {state.isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Finding Links...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Find Links
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

const ResultCard: React.FC<{ result: FinderResult }> = ({ result }) => {
  const { dispatch } = useLinkFinder();

  const handleToggleSelection = () => {
    dispatch({ type: 'TOGGLE_RESULT_SELECTION', payload: result.id });
  };

  const handleFeedback = (feedback: 'up' | 'down') => {
    dispatch({ type: 'UPDATE_RESULT_FEEDBACK', payload: { id: result.id, feedback } });
    toast.success(`Feedback recorded: ${feedback === 'up' ? '👍' : '👎'}`);
  };

  const getTypeConfig = (type: LinkType) => {
    switch (type) {
      case 'article':
        return { icon: FileText, color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'video':
        return { icon: Video, color: 'bg-red-100 text-red-800 border-red-200' };
      case 'pdf':
        return { icon: FileIcon, color: 'bg-orange-100 text-orange-800 border-orange-200' };
      case 'repo':
        return { icon: GitBranch, color: 'bg-green-100 text-green-800 border-green-200' };
      case 'dataset':
        return { icon: Database, color: 'bg-purple-100 text-purple-800 border-purple-200' };
    }
  };

  const config = getTypeConfig(result.linkType);
  const Icon = config.icon;

  return (
    <Card className={`group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
      result.selected ? 'ring-2 ring-primary shadow-md' : 'hover:border-primary/20'
    }`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Checkbox
            checked={result.selected}
            onCheckedChange={handleToggleSelection}
            className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="text-2xl">{result.favicon}</span>
                <Badge variant="outline" className={`${config.color} font-medium`}>
                  <Icon className="h-3 w-3 mr-1" />
                  {result.linkType}
                </Badge>
                {result.readTime && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {result.readTime}
                  </Badge>
                )}
                {result.confidence && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    <Heart className="h-3 w-3 mr-1" />
                    {result.confidence}% match
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Info className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <div className="space-y-2">
                        <p className="font-medium text-sm">Why this link matched:</p>
                        {result.why.map((reason, index) => (
                          <p key={index} className="text-xs">• {reason}</p>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleFeedback('up')}
                  className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700"
                >
                  <ThumbsUp className="h-3 w-3" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleFeedback('down')}
                  className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700"
                >
                  <ThumbsDown className="h-3 w-3" />
                </Button>

                <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                  <a href={result.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
            
            <h3 className="font-semibold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {result.title}
            </h3>
            
            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
              {result.summary}
            </p>

            {result.domain && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Globe className="h-3 w-3 mr-1" />
                {result.domain}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const BulkToolbar: React.FC = () => {
  const { state, dispatch } = useLinkFinder();

  if (state.selectedResults.size === 0) return null;

  const handleAddSelected = () => {
    const selectedCount = state.selectedResults.size;
    toast.success(`✓ ${selectedCount} new bookmarks added to Inbox`, {
      action: {
        label: 'Undo',
        onClick: () => toast.info('Bookmarks removed')
      },
      duration: 8000
    });
    
    // Clear selections after adding
    dispatch({ type: 'SELECT_ALL_RESULTS', payload: false });
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-2">
      <Card className="shadow-xl border-primary/20 bg-white/95 backdrop-blur-sm">
        <CardContent className="flex items-center space-x-4 py-4 px-6">
          <Badge variant="secondary" className="font-medium">
            {state.selectedResults.size} selected
          </Badge>
          <Button onClick={handleAddSelected} className="bg-primary hover:bg-primary/90 shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Selected
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const EmptyState: React.FC = () => {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <Search className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              Ready to find amazing links?
            </h3>
            <p className="text-sm text-muted-foreground">
              Enter a topic in the search builder and let AI discover relevant content tailored to your interests.
            </p>
          </div>
          <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              Articles
            </div>
            <div className="flex items-center">
              <Video className="h-4 w-4 mr-1" />
              Videos
            </div>
            <div className="flex items-center">
              <GitBranch className="h-4 w-4 mr-1" />
              Repos
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ResultsGrid: React.FC = () => {
  const { state, dispatch } = useLinkFinder();

  if (state.isLoading) {
    return <SearchProgress />;
  }

  if (state.results.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Results</h2>
          <p className="text-sm text-muted-foreground">
            Found {state.results.length} relevant links
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch({ type: 'SELECT_ALL_RESULTS', payload: true })}
            className="text-xs"
          >
            <Eye className="h-3 w-3 mr-1" />
            Select All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch({ type: 'SELECT_ALL_RESULTS', payload: false })}
            className="text-xs"
          >
            Clear All
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {state.results.map((result) => (
          <ResultCard key={result.id} result={result} />
        ))}
      </div>

      <BulkToolbar />
    </div>
  );
};

// Provider component
const LinkFinderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(linkFinderReducer, {
    prefs: defaultPrefs,
    results: [],
    isLoading: false,
    hasUnsavedChanges: false,
    selectedResults: new Set<string>(),
    searchProgress: 0,
    currentSearchStep: ''
  });

  // Load preferences from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('linkFinderPrefs');
    if (saved) {
      try {
        const prefs = JSON.parse(saved);
        dispatch({ type: 'SET_PREFS', payload: prefs });
        dispatch({ type: 'SET_UNSAVED_CHANGES', payload: false });
      } catch (error) {
        console.error('Failed to load link finder preferences:', error);
      }
    }
  }, []);

  useEffect(() => {
    ;(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        try {
          const remote = await getOracleSetting<LinkFinderPrefs>(user.id, 'link_finder', defaultPrefs)
          dispatch({ type: 'SET_PREFS', payload: remote })
        } catch (error) {
          console.error('Failed to load link finder settings:', error)
        }
      }
    })()
  }, [])

  const savePreferences = async (prefs: LinkFinderPrefs) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      try {
        await saveAISetting<LinkFinderPrefs>(user.id, 'link_finder', prefs)
        toast.success('Link finder preferences saved')
      } catch (error) {
        console.error('Failed to save link finder preferences:', error)
        toast.error('Failed to save preferences')
      }
    }
  }

  return (
    <LinkFinderContext.Provider value={{ state, dispatch }}>
      {children}
    </LinkFinderContext.Provider>
  );
};

// Main component
export default function LinkFinderPage() {
  return (
    <LinkFinderProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              AI Link Finder
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Discover relevant links using AI-powered search tailored to your interests and preferences
            </p>
          </div>

          <UnsavedChangesBar />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Query Builder - Sticky Sidebar */}
            <div className="lg:col-span-1">
              <QueryBuilder />
            </div>

            {/* Results - Main Content */}
            <div className="lg:col-span-2">
              <ResultsGrid />
            </div>
          </div>
        </div>
      </div>
    </LinkFinderProvider>
  );
} 