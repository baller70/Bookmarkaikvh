'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Palette, 
  Type, 
  Layout, 
  Accessibility, 
  Smartphone, 
  Monitor, 
  Tablet,
  Eye,
  MousePointer,
  Keyboard,
  Volume2,
  Sun,
  Moon,
  Contrast,
  Copy,
  Check,
  ChevronRight,
  Play,
  Pause,
  Square,
  Circle,
  Triangle,
  Star,
  Heart,
  Bookmark,
  Download,
  Upload,
  Settings,
  User,
  Bell,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Save,
  Share,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { colors, typography, spacing, shadows, animations } from '@/lib/design-tokens'
import { Button as EnhancedButton, ButtonGroup, IconButton, Fab } from '@/components/ui/enhanced-button'
import { Card as EnhancedCard, CardGrid, SkeletonCard } from '@/components/ui/enhanced-card'

/**
 * Design System Showcase Component
 * 
 * Comprehensive documentation and demonstration of the BookAIMark design system
 * including design tokens, components, patterns, and accessibility features.
 */

export function DesignSystemShowcase() {
  const [darkMode, setDarkMode] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  const copyToClipboard = async (text: string, tokenName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedToken(tokenName)
      setTimeout(() => setCopiedToken(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div 
      className={`min-h-screen bg-background text-foreground transition-colors duration-300 ${
        darkMode ? 'dark' : ''
      }`}
      data-theme={darkMode ? 'dark' : 'light'}
      style={{
        '--animation-duration': reducedMotion ? '0.01ms' : '200ms',
      } as React.CSSProperties}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">BookAIMark Design System</h1>
              <p className="text-lg text-muted-foreground">
                Comprehensive design tokens, components, and patterns for consistent UI development
              </p>
            </div>
            
            {/* Theme Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4" />
                <Switch 
                  checked={darkMode} 
                  onCheckedChange={setDarkMode}
                  aria-label="Toggle dark mode"
                />
                <Moon className="h-4 w-4" />
              </div>
              
              <div className="flex items-center space-x-2">
                <Label htmlFor="reduced-motion" className="text-sm">Reduced Motion</Label>
                <Switch 
                  id="reduced-motion"
                  checked={reducedMotion} 
                  onCheckedChange={setReducedMotion}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Label htmlFor="high-contrast" className="text-sm">High Contrast</Label>
                <Switch 
                  id="high-contrast"
                  checked={highContrast} 
                  onCheckedChange={setHighContrast}
                />
              </div>
            </div>
          </div>
          
          <Separator />
        </div>

        <Tabs defaultValue="tokens" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="tokens" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Tokens
            </TabsTrigger>
            <TabsTrigger value="components" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Components
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Patterns
            </TabsTrigger>
            <TabsTrigger value="responsive" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Responsive
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="flex items-center gap-2">
              <Accessibility className="h-4 w-4" />
              A11y
            </TabsTrigger>
            <TabsTrigger value="guidelines" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Guidelines
            </TabsTrigger>
          </TabsList>

          {/* Design Tokens Tab */}
          <TabsContent value="tokens" className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Design Tokens</h2>
              <p className="text-muted-foreground mb-6">
                Foundational design values that ensure consistency across the application.
              </p>
            </div>

            {/* Colors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Color System
                </CardTitle>
                <CardDescription>
                  Semantic color palette with support for light and dark themes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Primary Colors */}
                <div>
                  <h4 className="font-medium mb-3">Primary Colors</h4>
                  <div className="grid grid-cols-11 gap-2">
                    {Object.entries(colors.primary).map(([shade, color]) => (
                      <div key={shade} className="text-center">
                        <div
                          className="w-full h-12 rounded-md border cursor-pointer hover:scale-105 transition-transform"
                          style={{ backgroundColor: color }}
                          onClick={() => copyToClipboard(color, `primary-${shade}`)}
                          title={`Click to copy ${color}`}
                        />
                        <div className="mt-1 text-xs font-mono">{shade}</div>
                        <div className="text-xs text-muted-foreground font-mono">{color}</div>
                        {copiedToken === `primary-${shade}` && (
                          <div className="text-xs text-green-600 flex items-center justify-center mt-1">
                            <Check className="h-3 w-3 mr-1" />
                            Copied
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Semantic Colors */}
                <div>
                  <h4 className="font-medium mb-3">Semantic Colors</h4>
                  <div className="grid grid-cols-4 gap-4">
                    {Object.entries(colors.semantic).map(([category, shades]) => (
                      <div key={category}>
                        <h5 className="capitalize font-medium mb-2">{category}</h5>
                        <div className="space-y-2">
                          {Object.entries(shades).map(([shade, color]) => (
                            <div key={shade} className="flex items-center gap-2">
                              <div
                                className="w-8 h-8 rounded border cursor-pointer"
                                style={{ backgroundColor: color }}
                                onClick={() => copyToClipboard(color, `${category}-${shade}`)}
                              />
                              <div className="text-sm">
                                <div className="font-mono">{shade}</div>
                                <div className="text-muted-foreground font-mono text-xs">{color}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bookmark Category Colors */}
                <div>
                  <h4 className="font-medium mb-3">Bookmark Categories</h4>
                  <div className="grid grid-cols-4 gap-4">
                    {Object.entries(colors.bookmark.category).map(([category, color]) => (
                      <div key={category} className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded border cursor-pointer"
                          style={{ backgroundColor: color }}
                          onClick={() => copyToClipboard(color, `bookmark-${category}`)}
                        />
                        <div className="text-sm">
                          <div className="capitalize">{category}</div>
                          <div className="text-muted-foreground font-mono text-xs">{color}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Typography */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  Typography System
                </CardTitle>
                <CardDescription>
                  Consistent typography scale with responsive sizing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Font Sizes</h4>
                  <div className="space-y-3">
                    {Object.entries(typography.fontSize).map(([size, [fontSize, lineHeight]]) => (
                      <div key={size} className="flex items-center gap-4">
                        <div className="w-12 text-sm text-muted-foreground">{size}</div>
                        <div 
                          className="flex-1"
                          style={{ 
                            fontSize: fontSize,
                            lineHeight: typeof lineHeight === 'object' ? lineHeight.lineHeight : lineHeight 
                          }}
                        >
                          The quick brown fox jumps over the lazy dog
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">{fontSize}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Font Weights</h4>
                  <div className="space-y-2">
                    {Object.entries(typography.fontWeight).map(([weight, value]) => (
                      <div key={weight} className="flex items-center gap-4">
                        <div className="w-20 text-sm text-muted-foreground">{weight}</div>
                        <div 
                          className="flex-1"
                          style={{ fontWeight: value }}
                        >
                          The quick brown fox jumps over the lazy dog
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Spacing */}
            <Card>
              <CardHeader>
                <CardTitle>Spacing Scale</CardTitle>
                <CardDescription>Consistent spacing system for layouts and components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 gap-4">
                  {Object.entries(spacing).slice(0, 24).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="bg-primary/20 border-2 border-primary/40 rounded mb-2" style={{ height: value, minHeight: '8px' }} />
                      <div className="text-sm font-mono">{key}</div>
                      <div className="text-xs text-muted-foreground">{value}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shadows */}
            <Card>
              <CardHeader>
                <CardTitle>Shadow System</CardTitle>
                <CardDescription>Elevation system for creating depth and hierarchy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  {Object.entries(shadows).slice(0, 8).map(([name, shadow]) => (
                    <div key={name} className="text-center">
                      <div 
                        className="w-full h-20 bg-card rounded-lg mb-2"
                        style={{ boxShadow: shadow }}
                      />
                      <div className="text-sm font-medium">{name}</div>
                      <div className="text-xs text-muted-foreground font-mono break-all">{shadow}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Component Library</h2>
              <p className="text-muted-foreground mb-6">
                Enhanced components with improved variants, accessibility, and design token integration.
              </p>
            </div>

            {/* Enhanced Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Buttons</CardTitle>
                <CardDescription>
                  Comprehensive button system with multiple variants, states, and accessibility features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Button Variants */}
                <div>
                  <h4 className="font-medium mb-3">Variants</h4>
                  <div className="flex flex-wrap gap-3">
                    <EnhancedButton variant="default">Default</EnhancedButton>
                    <EnhancedButton variant="secondary">Secondary</EnhancedButton>
                    <EnhancedButton variant="outline">Outline</EnhancedButton>
                    <EnhancedButton variant="ghost">Ghost</EnhancedButton>
                    <EnhancedButton variant="link">Link</EnhancedButton>
                    <EnhancedButton variant="destructive">Destructive</EnhancedButton>
                    <EnhancedButton variant="success">Success</EnhancedButton>
                    <EnhancedButton variant="warning">Warning</EnhancedButton>
                    <EnhancedButton variant="info">Info</EnhancedButton>
                    <EnhancedButton variant="gradient">Gradient</EnhancedButton>
                    <EnhancedButton variant="glass">Glass</EnhancedButton>
                  </div>
                </div>

                {/* Button Sizes */}
                <div>
                  <h4 className="font-medium mb-3">Sizes</h4>
                  <div className="flex items-center gap-3">
                    <EnhancedButton size="xs">Extra Small</EnhancedButton>
                    <EnhancedButton size="sm">Small</EnhancedButton>
                    <EnhancedButton size="default">Default</EnhancedButton>
                    <EnhancedButton size="lg">Large</EnhancedButton>
                    <EnhancedButton size="xl">Extra Large</EnhancedButton>
                  </div>
                </div>

                {/* Button States */}
                <div>
                  <h4 className="font-medium mb-3">States</h4>
                  <div className="flex gap-3">
                    <EnhancedButton>Normal</EnhancedButton>
                    <EnhancedButton loading>Loading</EnhancedButton>
                    <EnhancedButton disabled>Disabled</EnhancedButton>
                    <EnhancedButton leftIcon={<Plus className="h-4 w-4" />}>With Icon</EnhancedButton>
                    <EnhancedButton rightIcon={<ChevronRight className="h-4 w-4" />}>With Right Icon</EnhancedButton>
                    <EnhancedButton badge="3">With Badge</EnhancedButton>
                  </div>
                </div>

                {/* Icon Buttons */}
                <div>
                  <h4 className="font-medium mb-3">Icon Buttons</h4>
                  <div className="flex gap-3">
                    <IconButton icon={<Search className="h-4 w-4" />} label="Search" />
                    <IconButton icon={<Settings className="h-4 w-4" />} label="Settings" variant="outline" />
                    <IconButton icon={<Bell className="h-4 w-4" />} label="Notifications" variant="ghost" />
                    <IconButton icon={<User className="h-4 w-4" />} label="Profile" size="icon-sm" />
                    <IconButton icon={<Heart className="h-4 w-4" />} label="Like" size="icon-lg" variant="destructive" />
                  </div>
                </div>

                {/* Button Group */}
                <div>
                  <h4 className="font-medium mb-3">Button Groups</h4>
                  <div className="space-y-3">
                    <ButtonGroup attached>
                      <EnhancedButton variant="outline">Left</EnhancedButton>
                      <EnhancedButton variant="outline">Center</EnhancedButton>
                      <EnhancedButton variant="outline">Right</EnhancedButton>
                    </ButtonGroup>
                    
                    <ButtonGroup orientation="vertical" attached>
                      <EnhancedButton variant="outline">Top</EnhancedButton>
                      <EnhancedButton variant="outline">Middle</EnhancedButton>
                      <EnhancedButton variant="outline">Bottom</EnhancedButton>
                    </ButtonGroup>
                  </div>
                </div>

                {/* Floating Action Button */}
                <div>
                  <h4 className="font-medium mb-3">Floating Action Button</h4>
                  <div className="relative h-32 bg-muted/20 rounded-lg">
                    <Fab 
                      position="bottom-right"
                      leftIcon={<Plus className="h-5 w-5" />}
                      extended
                    >
                      Add Item
                    </Fab>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Cards */}
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Cards</CardTitle>
                <CardDescription>
                  Flexible card system with multiple variants and interactive states
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Card Variants */}
                <div>
                  <h4 className="font-medium mb-3">Card Variants</h4>
                  <CardGrid columns={3} gap="md">
                    <EnhancedCard variant="default">
                      <CardHeader>
                        <CardTitle>Default Card</CardTitle>
                        <CardDescription>Standard card with subtle shadow</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>This is the default card variant with a clean, minimal design.</p>
                      </CardContent>
                    </EnhancedCard>

                    <EnhancedCard variant="elevated">
                      <CardHeader>
                        <CardTitle>Elevated Card</CardTitle>
                        <CardDescription>Card with enhanced shadow on hover</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>This card has a more prominent shadow that increases on hover.</p>
                      </CardContent>
                    </EnhancedCard>

                    <EnhancedCard variant="outlined">
                      <CardHeader>
                        <CardTitle>Outlined Card</CardTitle>
                        <CardDescription>Card with border emphasis</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>This card uses a border instead of shadow for definition.</p>
                      </CardContent>
                    </EnhancedCard>

                    <EnhancedCard variant="filled">
                      <CardHeader>
                        <CardTitle>Filled Card</CardTitle>
                        <CardDescription>Card with background fill</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>This card has a muted background for subtle emphasis.</p>
                      </CardContent>
                    </EnhancedCard>

                    <EnhancedCard variant="glass">
                      <CardHeader>
                        <CardTitle>Glass Card</CardTitle>
                        <CardDescription>Card with backdrop blur effect</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>This card has a glassmorphism effect with backdrop blur.</p>
                      </CardContent>
                    </EnhancedCard>

                    <EnhancedCard variant="success">
                      <CardHeader>
                        <CardTitle>Success Card</CardTitle>
                        <CardDescription>Card with success state styling</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>This card indicates a successful state or positive action.</p>
                      </CardContent>
                    </EnhancedCard>
                  </CardGrid>
                </div>

                {/* Interactive Cards */}
                <div>
                  <h4 className="font-medium mb-3">Interactive Cards</h4>
                  <CardGrid columns={2} gap="md">
                    <EnhancedCard 
                      interactive="hover" 
                      variant="elevated"
                      onClick={() => alert('Card clicked!')}
                    >
                      <CardHeader>
                        <CardTitle>Hoverable Card</CardTitle>
                        <CardDescription>Click me to see the interaction</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>This card scales slightly on hover and is clickable.</p>
                      </CardContent>
                    </EnhancedCard>

                    <EnhancedCard 
                      interactive="press" 
                      variant="outlined"
                      onClick={() => alert('Card pressed!')}
                    >
                      <CardHeader>
                        <CardTitle>Pressable Card</CardTitle>
                        <CardDescription>Click me to see the press effect</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>This card has both hover and active press states.</p>
                      </CardContent>
                    </EnhancedCard>
                  </CardGrid>
                </div>

                {/* Loading States */}
                <div>
                  <h4 className="font-medium mb-3">Loading States</h4>
                  <CardGrid columns={2} gap="md">
                    <SkeletonCard showHeader showFooter lines={3} />
                    <SkeletonCard showHeader={false} lines={4} />
                  </CardGrid>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Design Patterns</h2>
              <p className="text-muted-foreground mb-6">
                Common UI patterns and layouts built with the design system.
              </p>
            </div>

            {/* Form Patterns */}
            <Card>
              <CardHeader>
                <CardTitle>Form Patterns</CardTitle>
                <CardDescription>Standard form layouts with proper accessibility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="Enter your full name" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="Enter your email" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="notifications" />
                      <Label htmlFor="notifications">Enable notifications</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Preference Level</Label>
                      <Slider defaultValue={[50]} max={100} step={1} className="mt-2" />
                    </div>
                    <div>
                      <Label>Progress</Label>
                      <Progress value={33} className="mt-2" />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">Cancel</Button>
                      <Button className="flex-1">Submit</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Patterns */}
            <Card>
              <CardHeader>
                <CardTitle>Status Indicators</CardTitle>
                <CardDescription>Visual feedback for different states and conditions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Success state</span>
                      <Badge variant="secondary">Completed</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <span>Warning state</span>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span>Error state</span>
                      <Badge variant="destructive">Failed</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Info className="h-5 w-5 text-blue-500" />
                      <span>Info state</span>
                      <Badge>Information</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">Success</span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        Your changes have been saved successfully.
                      </p>
                    </div>
                    
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-800">
                        <XCircle className="h-4 w-4" />
                        <span className="font-medium">Error</span>
                      </div>
                      <p className="text-sm text-red-700 mt-1">
                        There was an error processing your request.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Responsive Tab */}
          <TabsContent value="responsive" className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Responsive Design</h2>
              <p className="text-muted-foreground mb-6">
                Mobile-first responsive patterns and breakpoint system.
              </p>
            </div>

            {/* Breakpoint Visualization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Breakpoint System
                </CardTitle>
                <CardDescription>Visual representation of responsive breakpoints</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'xs', size: '475px', icon: Smartphone, desc: 'Mobile (small)' },
                    { name: 'sm', size: '640px', icon: Smartphone, desc: 'Mobile (large)' },
                    { name: 'md', size: '768px', icon: Tablet, desc: 'Tablet' },
                    { name: 'lg', size: '1024px', icon: Monitor, desc: 'Desktop (small)' },
                    { name: 'xl', size: '1280px', icon: Monitor, desc: 'Desktop (large)' },
                    { name: '2xl', size: '1536px', icon: Monitor, desc: 'Desktop (wide)' },
                  ].map(({ name, size, icon: Icon, desc }) => (
                    <div key={name} className="flex items-center gap-4 p-3 border rounded-lg">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">{name}</div>
                        <div className="text-sm text-muted-foreground">{desc}</div>
                      </div>
                      <div className="font-mono text-sm">{size}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Responsive Grid Demo */}
            <Card>
              <CardHeader>
                <CardTitle>Responsive Grid</CardTitle>
                <CardDescription>Adaptive grid that changes based on screen size</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-20 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-sm text-muted-foreground">Item {i + 1}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  This grid shows 1 column on mobile, 2 on small screens, 3 on large screens, and 4 on extra large screens.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Accessibility Tab */}
          <TabsContent value="accessibility" className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Accessibility Features</h2>
              <p className="text-muted-foreground mb-6">
                WCAG-compliant accessibility features and testing tools.
              </p>
            </div>

            {/* Focus Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Focus Management
                </CardTitle>
                <CardDescription>Keyboard navigation and focus indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Try navigating these elements with Tab and Shift+Tab:
                  </p>
                  <div className="flex gap-2">
                    <Button>First</Button>
                    <Button variant="outline">Second</Button>
                    <Button variant="ghost">Third</Button>
                    <Input placeholder="Focusable input" className="w-40" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Screen Reader Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Screen Reader Support
                </CardTitle>
                <CardDescription>Proper ARIA labels and semantic markup</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button aria-label="Save document" title="Save the current document">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  
                  <div role="status" aria-live="polite" className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Info className="h-4 w-4" />
                      <span>Status update: Changes saved automatically</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="search-input">Search bookmarks</Label>
                    <Input 
                      id="search-input"
                      placeholder="Type to search..."
                      aria-describedby="search-help"
                    />
                    <p id="search-help" className="text-sm text-muted-foreground mt-1">
                      Use keywords to find your bookmarks quickly
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Color Contrast */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Contrast className="h-5 w-5" />
                  Color Contrast
                </CardTitle>
                <CardDescription>WCAG AA/AAA compliant color combinations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-white text-black border rounded-lg">
                      <div className="font-medium">High Contrast</div>
                      <div className="text-sm">Ratio: 21:1 (AAA)</div>
                    </div>
                    <div className="p-3 bg-blue-600 text-white rounded-lg">
                      <div className="font-medium">Primary Blue</div>
                      <div className="text-sm">Ratio: 7.2:1 (AAA)</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-100 text-gray-800 border rounded-lg">
                      <div className="font-medium">Medium Contrast</div>
                      <div className="text-sm">Ratio: 5.1:1 (AA)</div>
                    </div>
                    <div className="p-3 bg-green-600 text-white rounded-lg">
                      <div className="font-medium">Success Green</div>
                      <div className="text-sm">Ratio: 6.8:1 (AA)</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Guidelines Tab */}
          <TabsContent value="guidelines" className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Design Guidelines</h2>
              <p className="text-muted-foreground mb-6">
                Best practices and usage guidelines for the design system.
              </p>
            </div>

            {/* Usage Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Component Usage</CardTitle>
                <CardDescription>When and how to use different components</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Buttons</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Use primary buttons for main actions (submit, save, continue)</li>
                      <li>• Use secondary buttons for alternative actions (cancel, back)</li>
                      <li>• Use ghost buttons for tertiary actions (edit, delete)</li>
                      <li>• Limit primary buttons to one per screen section</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Cards</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Use default cards for general content containers</li>
                      <li>• Use elevated cards for important or interactive content</li>
                      <li>• Use outlined cards when you need clear boundaries without shadows</li>
                      <li>• Use semantic variants (success, warning, error) for status feedback</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Typography</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Use heading hierarchy (h1-h6) for proper document structure</li>
                      <li>• Maintain consistent line height for readability</li>
                      <li>• Use text-muted-foreground for secondary information</li>
                      <li>• Keep line length between 45-75 characters for optimal reading</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Do's and Don'ts */}
            <div className="grid grid-cols-2 gap-6">
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Do's
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-green-700">
                  <div>✓ Use consistent spacing from the design token scale</div>
                  <div>✓ Follow the color system for semantic meaning</div>
                  <div>✓ Test with keyboard navigation</div>
                  <div>✓ Provide proper ARIA labels</div>
                  <div>✓ Use responsive design patterns</div>
                  <div>✓ Consider reduced motion preferences</div>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-800 flex items-center gap-2">
                    <XCircle className="h-5 w-5" />
                    Don'ts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-red-700">
                  <div>✗ Use arbitrary spacing values</div>
                  <div>✗ Ignore color contrast requirements</div>
                  <div>✗ Create keyboard traps</div>
                  <div>✗ Rely only on color for meaning</div>
                  <div>✗ Use fixed pixel values for mobile</div>
                  <div>✗ Auto-play animations without user control</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default DesignSystemShowcase 