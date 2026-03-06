# Basic Vite + React App Template

Just a quick, generated with Claude Opus 4.5 via LMArena, React App Template.

Often when I start a new app, some of my time is eaten by rewriting basic conceptts, like
buttons, modals, form fields, snackbar engine, context menus and stuff like that. So I used
AI tools to generate a nice template, just so I can start writing logic for my future app. 
I've done something similar years ago, but I'm not very proud of some things there.

## Version 1.0

~~This is just a start, created to test how well can Claude Opus 4.5 handle the task. The results - looks nice~~
~~on the front, but need a lot of cleanup in the code, so...~~

There was some work to do, to cleanup files, but it is how I used to make stuff, so it's ok. 

## Roadmap

1. ~~Clean components file~~
2. ~~xtract types to types files~~
3. ~~Extract styled components to styles files~~
4. ~~Improve syntax of components~~
5. ~~Write documentation of use~~
6. Analyze and **fix** "HOW TO USE" section in documentation, becouse it was AI generated with same Claude Opus 4.5

===

# How To Use

# UI Template

A comprehensive React UI component library styled after generic apps dark theme interfaces. Built with React, TypeScript, and Styled Components.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Components](#components)
  - [Layout](#layout)
    - [Grid](#grid)
    - [Column & Row](#column--row)
    - [FlexItem](#flexitem)
    - [FullScreen & Container](#fullscreen--container)
  - [Box](#box)
  - [Button](#button)
    - [Button](#button-1)
    - [IconButton](#iconbutton)
    - [TextButton](#textbutton)
    - [ButtonGroup](#buttongroup)
  - [Sidebar](#sidebar)
  - [Collapsible](#collapsible)
  - [TreeItem](#treeitem)
  - [Tooltip](#tooltip)
  - [Modal](#modal)
  - [ConfirmDialog](#confirmdialog)
  - [Snackbar](#snackbar)
  - [ContextMenu](#contextmenu)
  - [Form Components](#form-components)
    - [Input](#input)
    - [Textarea](#textarea)
    - [Switch](#switch)
    - [Checkbox](#checkbox)
    - [Radio & RadioGroup](#radio--radiogroup)
    - [Select](#select)
    - [MultiSelect](#multiselect)
  - [Loaders](#loaders)
    - [Loader](#loader)
    - [Skeleton](#skeleton)
    - [PageLoader](#pageloader)
    - [ContentLoader](#contentloader)
- [Hooks](#hooks)
  - [useGetData](#usegetdata)
  - [useGetDataWithPolling](#usegetdatawithpolling)
  - [useGetDataCached](#usegetdatacached)
- [Theming](#theming)

---

## Installation

```bash
npm install
npm run dev
# this should do the trick
```

## Quick Start

Wrap your application with `ThemeProvider` and `SnackbarProvider`:

```tsx
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { GlobalStyles } from './styles/GlobalStyles';
import { SnackbarProvider } from './components';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles theme={theme} />
      <SnackbarProvider>
        <YourApp />
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;
```

---

## Components

### Layout

#### Grid

CSS Grid-based layout component with flexible configuration.

```tsx
import Grid from "@/components/Layout/Grid";

// Basic grid with 3 columns
<Grid columns={3} gap="16px">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>

// Custom column template
<Grid columns="200px 1fr 1fr" gap="24px">
  <div>Sidebar</div>
  <div>Content</div>
  <div>Aside</div>
</Grid>

// Responsive grid
<Grid columns="repeat(auto-fit, minmax(300px, 1fr))" gap="16px">
  <div>Auto-sizing item 1</div>
  <div>Auto-sizing item 2</div>
  <div>Auto-sizing item 3</div>
</Grid>

// Grid with rows
<Grid columns={2} rows={3} gap="16px" fullHeight>
  <div>Cell 1</div>
  <div>Cell 2</div>
  <div>Cell 3</div>
  <div>Cell 4</div>
  <div>Cell 5</div>
  <div>Cell 6</div>
</Grid>

// Grid Item with span
<Grid columns={4} gap="16px">
  <Grid.Item colSpan={2}>Spans 2 columns</Grid.Item>
  <Grid.Item>Normal</Grid.Item>
  <Grid.Item rowSpan={2}>Spans 2 rows</Grid.Item>
  <Grid.Item colSpan={3}>Spans 3 columns</Grid.Item>
</Grid>
```

**Grid Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `number \| string` | - | Number of columns or grid-template-columns value |
| `rows` | `number \| string` | - | Number of rows or grid-template-rows value |
| `gap` | `string` | - | Gap between grid items |
| `rowGap` | `string` | - | Gap between rows |
| `columnGap` | `string` | - | Gap between columns |
| `alignItems` | `'start' \| 'center' \| 'end' \| 'stretch'` | - | Align items vertically |
| `justifyItems` | `'start' \| 'center' \| 'end' \| 'stretch'` | - | Align items horizontally |
| `fullHeight` | `boolean` | `false` | Set height to 100% |

**Grid.Item Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `colSpan` | `number \| string` | - | Number of columns to span |
| `rowSpan` | `number \| string` | - | Number of rows to span |
| `colStart` | `number \| string` | - | Starting column |
| `colEnd` | `number \| string` | - | Ending column |
| `rowStart` | `number \| string` | - | Starting row |
| `rowEnd` | `number \| string` | - | Ending row |

---

#### Column & Row

Flexbox-based layout components for vertical and horizontal arrangements.

```tsx
import { Button } from "@/components/Button/Button";
import { Column } from "@/components/Layout/Column";
import { Row } from "@/components/Layout/Row";

// Basic column layout
<Column gap="16px">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Column>

// Column with alignment
<Column gap="16px" align="center" justify="space-between" fullHeight>
  <div>Top</div>
  <div>Middle</div>
  <div>Bottom</div>
</Column>

// Basic row layout
<Row gap="8px">
  <Button>Button 1</Button>
  <Button>Button 2</Button>
  <Button>Button 3</Button>
</Row>

// Row with wrapping
<Row gap="8px" wrap justify="center">
  {items.map(item => (
    <Card key={item.id}>{item.name}</Card>
  ))}
</Row>

// Nested layouts
<Column gap="24px" fullHeight>
  <Row justify="space-between" align="center">
    <h1>Title</h1>
    <Button>Action</Button>
  </Row>
  <Row gap="16px" fullHeight>
    <Column gap="8px" style={{ width: '200px' }}>
      <NavItem>Home</NavItem>
      <NavItem>About</NavItem>
    </Column>
    <Column gap="16px" grow={1}>
      <Content />
    </Column>
  </Row>
</Column>
```

**Column/Row Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gap` | `string` | - | Gap between items |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch' \| 'baseline'` | - | Cross-axis alignment |
| `justify` | `'start' \| 'center' \| 'end' \| 'space-between' \| 'space-around' \| 'space-evenly'` | - | Main-axis alignment |
| `wrap` | `boolean` | `false` | Enable flex-wrap |
| `fullHeight` | `boolean` | `false` | Set height to 100% |
| `fullWidth` | `boolean` | `false` | Set width to 100% |
| `padding` | `string` | - | Padding value |

---

#### FlexItem

Flexible item for use within Column or Row.

```tsx
import { Column } from "@/components/Layout/Column";
import { FlexItem } from "@/components/Layout/FlexItem";
import { Row } from "@/components/Layout/Row";

<Row gap="16px">
  <FlexItem shrink={0} basis="200px">
    Fixed sidebar
  </FlexItem>
  <FlexItem grow={1}>
    Flexible content
  </FlexItem>
  <FlexItem shrink={0} basis="300px">
    Fixed aside
  </FlexItem>
</Row>

<Column fullHeight>
  <FlexItem shrink={0}>Header</FlexItem>
  <FlexItem grow={1}>Main content (fills space)</FlexItem>
  <FlexItem shrink={0}>Footer</FlexItem>
</Column>
```

**FlexItem Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `grow` | `number` | - | flex-grow value |
| `shrink` | `number` | - | flex-shrink value |
| `basis` | `string` | - | flex-basis value |
| `alignSelf` | `'start' \| 'center' \| 'end' \| 'stretch' \| 'baseline'` | - | Override parent alignment |
| `order` | `number` | - | Order in flex container |

---

#### FullScreen & Container

Full viewport and constrained container components.

```tsx
import Container from "@/components/Layout/Container";
import { FullScreen } from "@/components/Layout/FullScreen";

// Fullscreen centered content
<FullScreen center>
  <LoginForm />
</FullScreen>

// Fullscreen with padding
<FullScreen padding="24px">
  <Dashboard />
</FullScreen>

// Container with max-width
<Container maxWidth="lg" center padding="24px">
  <Article />
</Container>

// Combined usage
<FullScreen>
  <Container maxWidth="xl" center>
    <AppContent />
  </Container>
</FullScreen>
```

**FullScreen Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `center` | `boolean` | `false` | Center content both axes |
| `padding` | `string` | - | Padding value |

**Container Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `maxWidth` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'xxl' \| 'full'` | `'xl'` | Maximum width preset |
| `center` | `boolean` | `true` | Center container horizontally |
| `padding` | `string` | - | Padding value |

---

### Box

Versatile container component with optional header, footer, and various styles.

```tsx
import { Box } from "@/components/Box/Box";
import { IconButton } from "@/components/Box/styles";
import { Button } from "@/components/Button/Button";
import MoreIcon from "@/components/Icon/MoreIcon";
import SettingsIcon from "@/components/Icon/SettingsIcon";
import { Row } from "@/components/Layout/Row";

// Simple box
<Box>
  Simple content
</Box>

// Box with title
<Box title="Panel Title">
  Content with header
</Box>

// Closable box
<Box title="Closable Panel" closable onClose={() => handleClose()}>
  Click X to close
</Box>

// Collapsible box
<Box title="Collapsible Section" collapsible>
  This content can be collapsed
</Box>

// Collapsible, initially collapsed
<Box title="Initially Collapsed" collapsible defaultCollapsed>
  Hidden by default
</Box>

// Box with header actions
<Box 
  title="With Actions"
  headerActions={
    <>
      <IconButton><SettingsIcon /></IconButton>
      <IconButton><MoreIcon /></IconButton>
    </>
  }
>
  Content with action buttons in header
</Box>

// Box with footer
<Box 
  title="With Footer"
  footer={
    <Row justify="end" gap="8px">
      <Button variant="secondary">Cancel</Button>
      <Button>Save</Button>
    </Row>
  }
>
  Content with footer buttons
</Box>

// Box variants
<Box variant="default">Default (with border)</Box>
<Box variant="elevated">Elevated (with shadow)</Box>
<Box variant="outlined">Outlined (border only)</Box>
<Box variant="ghost">Ghost (transparent)</Box>

// Box with loading state
<Box title="Loading Content" loading={isLoading}>
  {data && <DataDisplay data={data} />}
</Box>

// Custom padding
<Box padding="32px">
  Extra padded content
</Box>

// Full height box
<Box title="Full Height" fullHeight>
  Takes full parent height
</Box>

// Max height with scroll
<Box title="Scrollable" maxHeight="300px">
  <LongContent />
</Box>
```

**Box Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Header title |
| `closable` | `boolean` | `false` | Show close button |
| `onClose` | `() => void` | - | Close button callback |
| `collapsible` | `boolean` | `false` | Enable collapse functionality |
| `defaultCollapsed` | `boolean` | `false` | Initial collapsed state |
| `headerActions` | `ReactNode` | - | Additional header elements |
| `footer` | `ReactNode` | - | Footer content |
| `variant` | `'default' \| 'elevated' \| 'outlined' \| 'ghost'` | `'default'` | Visual style |
| `padding` | `string` | - | Content padding |
| `fullHeight` | `boolean` | `false` | Set height to 100% |
| `maxHeight` | `string` | - | Maximum height with scroll |
| `loading` | `boolean` | `false` | Show loading overlay |

---

### Button

#### Button

Primary button component with multiple variants and states.

```tsx
import { Button } from "@/components/Button/Button";
import { CheckIcon } from "@/components/Form/styles";

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="tertiary">Tertiary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
<Button variant="success">Success</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>

// With icons
<Button leftIcon={<PlusIcon />}>Add Item</Button>
<Button rightIcon={<ArrowIcon />}>Next</Button>
<Button leftIcon={<SaveIcon />} rightIcon={<CheckIcon />}>Save</Button>

// States
<Button loading>Loading...</Button>
<Button disabled>Disabled</Button>

// Full width
<Button fullWidth>Full Width Button</Button>

// As link style
<Button asLink>Link Style Button</Button>

// With click handler
<Button onClick={() => handleClick()}>
  Click Me
</Button>
```

**Button Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'tertiary' \| 'ghost' \| 'danger' \| 'success'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `leftIcon` | `ReactNode` | - | Icon before text |
| `rightIcon` | `ReactNode` | - | Icon after text |
| `loading` | `boolean` | `false` | Show loading spinner |
| `disabled` | `boolean` | `false` | Disable button |
| `fullWidth` | `boolean` | `false` | Full width button |
| `asLink` | `boolean` | `false` | Render as link style |

---

#### IconButton

Icon-only button for compact actions.

```tsx
import CloseIcon from '@/components/Icon/CloseIcon';
import SettingsIcon from '@/components/Icon/SettingsIcon';
import { IconButton } from '@/components/Box/styles';

// Sizes
<IconButton size="sm"><EditIcon /></IconButton>
<IconButton size="md"><EditIcon /></IconButton>
<IconButton size="lg"><EditIcon /></IconButton>

// Variants
<IconButton variant="default"><SettingsIcon /></IconButton>
<IconButton variant="primary"><AddIcon /></IconButton>
<IconButton variant="ghost"><CloseIcon /></IconButton>

// Disabled
<IconButton disabled><LockIcon /></IconButton>
```

**IconButton Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `variant` | `'default' \| 'primary' \| 'ghost'` | `'default'` | Visual style |

---

#### TextButton

Text-only button with link-like appearance.

```tsx
import TextButton from "@/components/Button/TextButton";

<TextButton onClick={() => handleClick()}>
  Click me
</TextButton>

<TextButton disabled>
  Disabled link
</TextButton>
```

---

#### ButtonGroup

Group multiple buttons together.

```tsx
import { Button } from "@/components/Button/Button";
import ButtonGroup from "@/components/Button/ButtonGroup";

// Spaced buttons
<ButtonGroup>
  <Button variant="secondary">Left</Button>
  <Button variant="secondary">Center</Button>
  <Button variant="secondary">Right</Button>
</ButtonGroup>

// Attached buttons (no gap, connected borders)
<ButtonGroup attached>
  <Button variant="secondary">Left</Button>
  <Button variant="secondary">Center</Button>
  <Button variant="secondary">Right</Button>
</ButtonGroup>
```

**ButtonGroup Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `attached` | `boolean` | `false` | Connect buttons visually |

---

### Sidebar

Resizable and collapsible sidebar component.

```tsx
import { Button } from "@/components/Button/Button";
import Sidebar from "@/components/Sidebar/Sidebar";
import SidebarLayout from "@/components/Sidebar/SidebarLayout";
import { MainContent } from "@/components/Sidebar/styles";

// Basic sidebar with layout
<SidebarLayout
  leftSidebar={
    <Sidebar
      position="left"
      defaultWidth={260}
      minWidth={200}
      maxWidth={400}
      collapsible
      resizable
      header={<span style={{ fontWeight: 600 }}>EXPLORER</span>}
      footer={<Button variant="ghost" fullWidth>Settings</Button>}
    >
      <NavigationContent />
    </Sidebar>
  }
>
  <MainContent />
</SidebarLayout>

// Both sidebars
<SidebarLayout
  leftSidebar={
    <Sidebar position="left" defaultWidth={260} collapsible resizable>
      <LeftContent />
    </Sidebar>
  }
  rightSidebar={
    <Sidebar position="right" defaultWidth={300} collapsible>
      <RightContent />
    </Sidebar>
  }
>
  <MainContent />
</SidebarLayout>

// Initially collapsed
<Sidebar
  position="left"
  defaultWidth={260}
  collapsible
  defaultCollapsed
  collapsedWidth={48}
>
  <Content />
</Sidebar>

// Non-resizable sidebar
<Sidebar
  position="left"
  defaultWidth={200}
  resizable={false}
  collapsible
>
  <FixedWidthContent />
</Sidebar>
```

**Sidebar Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `'left' \| 'right'` | `'left'` | Sidebar position |
| `defaultWidth` | `number` | `260` | Initial width in pixels |
| `minWidth` | `number` | `200` | Minimum resize width |
| `maxWidth` | `number` | `500` | Maximum resize width |
| `collapsible` | `boolean` | `true` | Enable collapse button |
| `defaultCollapsed` | `boolean` | `false` | Start collapsed |
| `collapsedWidth` | `number` | `48` | Width when collapsed |
| `resizable` | `boolean` | `true` | Enable drag resize |
| `header` | `ReactNode` | - | Header content |
| `footer` | `ReactNode` | - | Footer content |

**SidebarLayout Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `leftSidebar` | `ReactNode` | - | Left sidebar component |
| `rightSidebar` | `ReactNode` | - | Right sidebar component |
| `children` | `ReactNode` | - | Main content |

---

### Collapsible

Expandable/collapsible section component.

```tsx
import { IconButton } from "@/components/Box/styles";
import Collapsible from "@/components/Collapsible/Collapsible";
import FolderIcon from "@/components/Icon/FolderIcon";

// Basic collapsible
<Collapsible title="Section Title">
  <p>Collapsible content here</p>
</Collapsible>

// Initially open
<Collapsible title="Open by Default" defaultOpen>
  <p>This section starts expanded</p>
</Collapsible>

// With icon
<Collapsible title="Documents" icon={<FolderIcon />}>
  <FileList />
</Collapsible>

// With actions
<Collapsible 
  title="Project Files" 
  icon={<FolderIcon />}
  actions={
    <>
      <IconButton size="sm"><PlusIcon /></IconButton>
      <IconButton size="sm"><RefreshIcon /></IconButton>
    </>
  }
>
  <FileTree />
</Collapsible>

// Nested collapsibles
<Collapsible title="src" icon={<FolderIcon />} defaultOpen>
  <Collapsible title="components" icon={<FolderIcon />} indent={1}>
    <Collapsible title="Button" icon={<FolderIcon />} indent={2}>
      <div>Button.tsx</div>
      <div>styles.ts</div>
    </Collapsible>
  </Collapsible>
</Collapsible>
```

**Collapsible Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `ReactNode` | - | Header title |
| `defaultOpen` | `boolean` | `false` | Initial expanded state |
| `icon` | `ReactNode` | - | Icon before title |
| `actions` | `ReactNode` | - | Action buttons (visible on hover) |
| `indent` | `number` | `0` | Indentation level |

---

### TreeItem

Tree view item for file explorers and hierarchical lists.

```tsx
import { IconButton } from "@/components/Box/styles";
import Collapsible from "@/components/Collapsible/Collapsible";
import TreeItem from "@/components/Collapsible/TreeItem";
import FileIcon from "@/components/Icon/FileIcon";
import FolderIcon from "@/components/Icon/FolderIcon";

// Simple tree item (leaf node)
<TreeItem 
  label="index.ts" 
  icon={<FileIcon />}
  onClick={() => openFile('index.ts')}
/>

// Selected item
<TreeItem 
  label="App.tsx" 
  icon={<FileIcon />}
  selected
  onClick={() => openFile('App.tsx')}
/>

// With actions
<TreeItem 
  label="config.json" 
  icon={<FileIcon />}
  actions={
    <IconButton size="sm"><EditIcon /></IconButton>
  }
  onClick={() => openFile('config.json')}
/>

// Nested structure (folder with children)
<TreeItem label="src" icon={<FolderIcon />}>
  <TreeItem label="components" icon={<FolderIcon />}>
    <TreeItem label="Button.tsx" icon={<FileIcon />} indent={2} onClick={() => {}} />
    <TreeItem label="Modal.tsx" icon={<FileIcon />} indent={2} onClick={() => {}} />
  </TreeItem>
  <TreeItem label="App.tsx" icon={<FileIcon />} indent={1} onClick={() => {}} />
</TreeItem>

// Complete file explorer
<Collapsible title="PROJECT" defaultOpen>
  <TreeItem label="src" icon={<FolderIcon />}>
    <TreeItem label="components" icon={<FolderIcon />}>
      <TreeItem label="Button" icon={<FolderIcon />}>
        <TreeItem label="Button.tsx" icon={<FileIcon />} indent={3} selected />
        <TreeItem label="styles.ts" icon={<FileIcon />} indent={3} />
        <TreeItem label="types.ts" icon={<FileIcon />} indent={3} />
      </TreeItem>
    </TreeItem>
    <TreeItem label="hooks" icon={<FolderIcon />}>
      <TreeItem label="useGetData.ts" icon={<FileIcon />} indent={2} />
    </TreeItem>
    <TreeItem label="App.tsx" icon={<FileIcon />} indent={1} />
    <TreeItem label="main.tsx" icon={<FileIcon />} indent={1} />
  </TreeItem>
  <TreeItem label="package.json" icon={<FileIcon />} />
  <TreeItem label="tsconfig.json" icon={<FileIcon />} />
</Collapsible>
```

**TreeItem Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `ReactNode` | - | Item label |
| `icon` | `ReactNode` | - | Icon before label |
| `indent` | `number` | `0` | Indentation level |
| `selected` | `boolean` | `false` | Selected state |
| `actions` | `ReactNode` | - | Action buttons |
| `onClick` | `() => void` | - | Click handler |
| `children` | `ReactNode` | - | Nested items (makes it a folder) |

---

### Tooltip

Hover tooltip component with positioning.

```tsx
import { IconButton } from "@/components/Box/styles";
import { Button } from "@/components/Button/Button";
import SettingsIcon from "@/components/Icon/SettingsIcon";
import { Column } from "@/components/Layout/Column";
import { Tooltip } from "@/components/Tooltip/Tooltip";

// Basic tooltip
<Tooltip content="This is a tooltip">
  <Button>Hover me</Button>
</Tooltip>

// Positions
<Tooltip content="Top tooltip" position="top">
  <span>Top</span>
</Tooltip>

<Tooltip content="Bottom tooltip" position="bottom">
  <span>Bottom</span>
</Tooltip>

<Tooltip content="Left tooltip" position="left">
  <span>Left</span>
</Tooltip>

<Tooltip content="Right tooltip" position="right">
  <span>Right</span>
</Tooltip>

// Custom delay
<Tooltip content="Delayed tooltip" delay={500}>
  <Button>Wait for it...</Button>
</Tooltip>

// Rich content
<Tooltip 
  content={
    <Column gap="4px">
      <strong>Keyboard Shortcut</strong>
      <code>Ctrl + S</code>
    </Column>
  }
>
  <Button>Save</Button>
</Tooltip>

// Disabled
<Tooltip content="Won't show" disabled>
  <span>No tooltip</span>
</Tooltip>

// On icon button
<Tooltip content="Settings" position="bottom">
  <IconButton>
    <SettingsIcon />
  </IconButton>
</Tooltip>
```

**Tooltip Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `ReactNode` | - | Tooltip content |
| `position` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Position relative to trigger |
| `delay` | `number` | `300` | Delay before showing (ms) |
| `disabled` | `boolean` | `false` | Disable tooltip |

---

### Modal

Flexible modal dialog with multiple variants.

```tsx
import { Button } from "@/components/Button/Button";
import Input from "@/components/Form/Input";
import SuccessIcon from "@/components/Icon/SuccessIcon";
import { Column } from "@/components/Layout/Column";
import Modal from "@/components/Modal/Modal";
import { useState } from "react";

const [isOpen, setIsOpen] = useState(false);

// Standard centered modal with overlay
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Edit Profile"
  footer={
    <>
      <Button variant="secondary" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleSave}>
        Save Changes
      </Button>
    </>
  }
>
  <Column gap="16px">
    <Input label="Name" value={name} onChange={e => setName(e.target.value)} />
    <Input label="Email" value={email} onChange={e => setEmail(e.target.value)} />
  </Column>
</Modal>

// Fit content (auto-sizing)
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Quick Action"
  variant="fit-content"
>
  <p>This modal fits its content</p>
</Modal>

// Fullscreen modal
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Full Editor"
  variant="fullscreen"
>
  <CodeEditor />
</Modal>

// Draggable modal (without blocking UI)
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Draggable Panel"
  variant="draggable"
  showOverlay={false}
>
  <p>Drag me by the header! The app behind is still usable.</p>
</Modal>

// Custom dimensions
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Wide Modal"
  width="800px"
  maxWidth="90vw"
  maxHeight="80vh"
>
  <LargeContent />
</Modal>

// Without close button
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Required Action"
  showCloseButton={false}
  closeOnOverlayClick={false}
  closeOnEscape={false}
>
  <p>You must complete this action</p>
  <Button onClick={() => setIsOpen(false)}>Complete</Button>
</Modal>

// Modal without title
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
>
  <Column gap="16px" align="center">
    <SuccessIcon size={48} />
    <h2>Success!</h2>
    <p>Your action was completed.</p>
    <Button onClick={() => setIsOpen(false)}>Close</Button>
  </Column>
</Modal>
```

**Modal Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Control modal visibility |
| `onClose` | `() => void` | - | Close callback |
| `title` | `string` | - | Modal title |
| `variant` | `'center' \| 'fullscreen' \| 'fit-content' \| 'draggable'` | `'center'` | Modal variant |
| `showOverlay` | `boolean` | `true` | Show dark overlay |
| `closeOnOverlayClick` | `boolean` | `true` | Close when clicking overlay |
| `closeOnEscape` | `boolean` | `true` | Close on Escape key |
| `showCloseButton` | `boolean` | `true` | Show X button |
| `width` | `string` | - | Modal width |
| `maxWidth` | `string` | `'90vw'` | Maximum width |
| `maxHeight` | `string` | `'90vh'` | Maximum height |
| `footer` | `ReactNode` | - | Footer content |

---

### ConfirmDialog

Pre-built confirmation dialog.

```tsx
import { Column } from "@/components/Layout/Column";
import ConfirmDialog from "@/components/Modal/ConfirmDialog";
import { useState } from "react";

const [isOpen, setIsOpen] = useState(false);

// Basic confirm dialog
<ConfirmDialog
  isOpen={isOpen}
  onConfirm={() => {
    handleDelete();
    setIsOpen(false);
  }}
  onCancel={() => setIsOpen(false)}
  title="Delete Item"
  message="Are you sure you want to delete this item? This action cannot be undone."
/>

// Danger variant
<ConfirmDialog
  isOpen={isOpen}
  onConfirm={handleDelete}
  onCancel={() => setIsOpen(false)}
  title="Delete Account"
  message="This will permanently delete your account and all data."
  variant="danger"
  confirmText="Delete Account"
  cancelText="Keep Account"
/>

// Warning variant
<ConfirmDialog
  isOpen={isOpen}
  onConfirm={handleProceed}
  onCancel={() => setIsOpen(false)}
  title="Unsaved Changes"
  message="You have unsaved changes. Do you want to leave without saving?"
  variant="warning"
  confirmText="Leave"
  cancelText="Stay"
/>

// Info variant
<ConfirmDialog
  isOpen={isOpen}
  onConfirm={handleConfirm}
  onCancel={() => setIsOpen(false)}
  title="Confirm Action"
  message={
    <Column gap="8px">
      <p>You are about to:</p>
      <ul>
        <li>Update 5 files</li>
        <li>Remove 2 dependencies</li>
      </ul>
      <p>Continue?</p>
    </Column>
  }
  variant="info"
/>
```

**ConfirmDialog Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Control visibility |
| `onConfirm` | `() => void` | - | Confirm callback |
| `onCancel` | `() => void` | - | Cancel callback |
| `title` | `string` | `'Confirm'` | Dialog title |
| `message` | `ReactNode` | - | Message content |
| `confirmText` | `string` | `'Confirm'` | Confirm button text |
| `cancelText` | `string` | `'Cancel'` | Cancel button text |
| `variant` | `'danger' \| 'warning' \| 'info'` | `'info'` | Visual variant |

---

### Snackbar

Toast notification system.

```tsx
import App from "@/App";
import { Button } from "@/components/Button/Button";
import { Row } from "@/components/Layout/Row";
import { SnackbarProvider, useSnackbar } from "@/components/Snackbar";

// 1. Wrap your app with SnackbarProvider
<SnackbarProvider maxSnackbars={5}>
  <App />
</SnackbarProvider>

// 2. Use the hook in components
const MyComponent = () => {
  const { showSnackbar, hideSnackbar, hideAll } = useSnackbar();

  // Info with auto-dismiss (3 seconds)
  const showInfo = () => {
    showSnackbar({
      message: 'File saved successfully',
      type: 'info',
      duration: 3000,
    });
  };

  // Success notification
  const showSuccess = () => {
    showSnackbar({
      message: 'Changes saved!',
      type: 'success',
      duration: 3000,
    });
  };

  // Warning with longer duration
  const showWarning = () => {
    showSnackbar({
      message: 'Your session will expire in 5 minutes',
      type: 'warning',
      duration: 5000,
    });
  };

  // Error without auto-dismiss (manual close only)
  const showError = () => {
    const id = showSnackbar({
      message: 'Failed to save changes',
      type: 'error',
      duration: 0, // 0 = no auto-dismiss
    });
    
    // Can close programmatically later
    // hideSnackbar(id);
  };

  // With action button
  const showWithAction = () => {
    showSnackbar({
      message: 'Item deleted',
      type: 'info',
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: () => handleUndo(),
      },
    });
  };

  // Clear all snackbars
  const clearAll = () => {
    hideAll();
  };

  return (
    <Row gap="8px">
      <Button onClick={showInfo}>Info</Button>
      <Button onClick={showSuccess}>Success</Button>
      <Button onClick={showWarning}>Warning</Button>
      <Button onClick={showError}>Error</Button>
      <Button onClick={showWithAction}>With Action</Button>
      <Button onClick={clearAll}>Clear All</Button>
    </Row>
  );
};
```

**SnackbarProvider Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `maxSnackbars` | `number` | `5` | Maximum visible snackbars |

**showSnackbar Options:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `ReactNode` | - | Notification message |
| `type` | `'info' \| 'success' \| 'warning' \| 'error'` | - | Notification type |
| `duration` | `number` | - | Auto-dismiss time (ms), 0 for manual |
| `action` | `{ label: string; onClick: () => void }` | - | Optional action button |

**useSnackbar Returns:**

| Method | Description |
|--------|-------------|
| `showSnackbar(options)` | Show snackbar, returns ID |
| `hideSnackbar(id)` | Hide specific snackbar |
| `hideAll()` | Hide all snackbars |

---

### ContextMenu

Dropdown context menu with nested submenus.

```tsx
import { IconButton } from "@/components/Box/styles";
import { Button } from "@/components/Button/Button";
import { ContextMenu } from "@/components/ContextMenu/ContextMenu";
import MoreIcon from "@/components/Icon/MoreIcon";
import SettingsIcon from "@/components/Icon/SettingsIcon";

// Basic menu
const menuItems = [
  {
    id: 'edit',
    label: 'Edit',
    icon: <EditIcon />,
    shortcut: 'Ctrl+E',
    onClick: () => handleEdit(),
  },
  {
    id: 'duplicate',
    label: 'Duplicate',
    icon: <CopyIcon />,
    onClick: () => handleDuplicate(),
  },
  { id: 'divider1', type: 'divider' },
  {
    id: 'delete',
    label: 'Delete',
    danger: true,
    onClick: () => handleDelete(),
  },
];

<ContextMenu
  trigger={
    <IconButton>
      <MoreIcon />
    </IconButton>
  }
  items={menuItems}
/>

// With nested submenus (up to 3 levels)
const nestedMenuItems = [
  {
    id: 'file',
    label: 'File',
    children: [
      {
        id: 'new',
        label: 'New',
        children: [
          { id: 'new-file', label: 'New File', shortcut: 'Ctrl+N', onClick: () => {} },
          { id: 'new-folder', label: 'New Folder', onClick: () => {} },
          { id: 'new-project', label: 'New Project...', onClick: () => {} },
        ],
      },
      { id: 'open', label: 'Open...', shortcut: 'Ctrl+O', onClick: () => {} },
      {
        id: 'open-recent',
        label: 'Open Recent',
        children: [
          { id: 'recent1', label: 'project-a/index.ts', onClick: () => {} },
          { id: 'recent2', label: 'project-b/main.tsx', onClick: () => {} },
          { id: 'divider', type: 'divider' },
          { id: 'clear-recent', label: 'Clear Recent', onClick: () => {} },
        ],
      },
      { id: 'divider1', type: 'divider' },
      { id: 'save', label: 'Save', shortcut: 'Ctrl+S', onClick: () => {} },
      { id: 'save-as', label: 'Save As...', shortcut: 'Ctrl+Shift+S', onClick: () => {} },
    ],
  },
  {
    id: 'edit',
    label: 'Edit',
    children: [
      { id: 'undo', label: 'Undo', shortcut: 'Ctrl+Z', onClick: () => {} },
      { id: 'redo', label: 'Redo', shortcut: 'Ctrl+Y', onClick: () => {} },
      { id: 'divider', type: 'divider' },
      { id: 'cut', label: 'Cut', shortcut: 'Ctrl+X', onClick: () => {} },
      { id: 'copy', label: 'Copy', shortcut: 'Ctrl+C', onClick: () => {} },
      { id: 'paste', label: 'Paste', shortcut: 'Ctrl+V', onClick: () => {} },
    ],
  },
  { id: 'divider2', type: 'divider' },
  {
    id: 'settings',
    label: 'Settings',
    icon: <SettingsIcon />,
    onClick: () => openSettings(),
  },
];

<ContextMenu
  trigger={<Button variant="secondary">File Menu</Button>}
  items={nestedMenuItems}
/>

// Disabled menu item
const itemsWithDisabled = [
  { id: 'enabled', label: 'Enabled Action', onClick: () => {} },
  { id: 'disabled', label: 'Disabled Action', disabled: true, onClick: () => {} },
];

// Disabled entire menu
<ContextMenu
  trigger={<IconButton disabled><MoreIcon /></IconButton>}
  items={menuItems}
  disabled
/>
```

**ContextMenu Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `trigger` | `ReactNode` | - | Element that opens menu |
| `items` | `MenuItem[]` | - | Menu items array |
| `disabled` | `boolean` | `false` | Disable menu |

**MenuItem Types:**

```tsx
// Action item
interface MenuItemAction {
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  onClick: () => void;
}

// Submenu item
interface MenuItemSubmenu {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  children: MenuItem[];
}

// Divider
interface MenuItemDivider {
  id: string;
  type: 'divider';
}
```

---

### Form Components

#### Input

Text input with label, icons, and validation states.

```tsx
import Input from "@/components/Form/Input";

// Basic input
<Input
  label="Username"
  placeholder="Enter username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
/>

// Full width
<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  fullWidth
/>

// With icons
<Input
  label="Search"
  placeholder="Search..."
  leftIcon={<SearchIcon />}
  rightIcon={<ClearIcon />}
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  fullWidth
/>

// With error
<Input
  label="Password"
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  error="Password must be at least 8 characters"
  fullWidth
/>

// With helper text
<Input
  label="API Key"
  value={apiKey}
  onChange={(e) => setApiKey(e.target.value)}
  helperText="You can find this in your dashboard"
  fullWidth
/>

// Disabled
<Input
  label="Readonly Field"
  value="Cannot edit this"
  disabled
  fullWidth
/>
```

**Input Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Input label |
| `error` | `string` | - | Error message |
| `helperText` | `string` | - | Helper text below input |
| `leftIcon` | `ReactNode` | - | Icon on left |
| `rightIcon` | `ReactNode` | - | Icon on right |
| `fullWidth` | `boolean` | `false` | Full width input |
| ...rest | - | - | All standard input props |

---

#### Textarea

Multi-line text input.

```tsx
import Textarea from "@/components/Form/Textarea";

// Basic textarea
<Textarea
  label="Description"
  placeholder="Enter description..."
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  fullWidth
/>

// With rows
<Textarea
  label="Comments"
  rows={5}
  value={comments}
  onChange={(e) => setComments(e.target.value)}
  fullWidth
/>

// Resize options
<Textarea label="Vertical resize" resize="vertical" fullWidth />
<Textarea label="Horizontal resize" resize="horizontal" fullWidth />
<Textarea label="Both directions" resize="both" fullWidth />
<Textarea label="No resize" resize="none" fullWidth />

// With error
<Textarea
  label="Bio"
  value={bio}
  onChange={(e) => setBio(e.target.value)}
  error="Bio is required"
  fullWidth
/>
```

**Textarea Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Textarea label |
| `error` | `string` | - | Error message |
| `helperText` | `string` | - | Helper text |
| `fullWidth` | `boolean` | `false` | Full width |
| `resize` | `'none' \| 'vertical' \| 'horizontal' \| 'both'` | `'vertical'` | Resize behavior |
| ...rest | - | - | All standard textarea props |

---

#### Switch

Toggle switch component.

```tsx
import { Switch } from "@/components/Form/Switch";

// Basic switch
<Switch
  label="Enable notifications"
  checked={notifications}
  onChange={(e) => setNotifications(e.target.checked)}
/>

// Label on left
<Switch
  label="Dark mode"
  labelPosition="left"
  checked={darkMode}
  onChange={(e) => setDarkMode(e.target.checked)}
/>

// Without label
<Switch
  checked={isEnabled}
  onChange={(e) => setIsEnabled(e.target.checked)}
/>

// Disabled
<Switch
  label="Premium feature"
  checked={false}
  disabled
/>
```

**Switch Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Switch label |
| `labelPosition` | `'left' \| 'right'` | `'right'` | Label position |
| ...rest | - | - | All standard checkbox props |

---

#### Checkbox

Checkbox input component.

```tsx
import { Checkbox } from "@/components/Form/Checkbox";
import { Column } from "@/components/Layout/Column";

// Basic checkbox
<Checkbox
  label="I agree to the terms"
  checked={agreed}
  onChange={(e) => setAgreed(e.target.checked)}
/>

// Indeterminate state (for "select all")
<Checkbox
  label="Select all"
  checked={allSelected}
  indeterminate={someSelected && !allSelected}
  onChange={handleSelectAll}
/>

// Disabled
<Checkbox
  label="Disabled option"
  checked={false}
  disabled
/>

// Group of checkboxes
<Column gap="8px">
  <Checkbox label="Option 1" checked={options.opt1} onChange={...} />
  <Checkbox label="Option 2" checked={options.opt2} onChange={...} />
  <Checkbox label="Option 3" checked={options.opt3} onChange={...} />
</Column>
```

**Checkbox Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Checkbox label |
| `indeterminate` | `boolean` | `false` | Indeterminate state |
| ...rest | - | - | All standard checkbox props |

---

#### Radio & RadioGroup

Radio button and group components.

```tsx
import Radio from "@/components/Form/Radio";
import RadioGroup from "@/components/Form/RadioGroup";
import { Column } from "@/components/Layout/Column";

// Basic radio group
<RadioGroup
  name="plan"
  value={selectedPlan}
  onChange={setSelectedPlan}
>
  <Radio value="free" label="Free Plan" />
  <Radio value="pro" label="Pro Plan - $9/mo" />
  <Radio value="enterprise" label="Enterprise - Contact us" />
</RadioGroup>

// Horizontal layout
<RadioGroup
  name="size"
  value={size}
  onChange={setSize}
  direction="horizontal"
>
  <Radio value="sm" label="Small" />
  <Radio value="md" label="Medium" />
  <Radio value="lg" label="Large" />
</RadioGroup>

// Individual radios (same name for grouping)
<Column gap="8px">
  <Radio 
    name="color" 
    value="red" 
    label="Red" 
    checked={color === 'red'}
    onChange={() => setColor('red')}
  />
  <Radio 
    name="color" 
    value="blue" 
    label="Blue"
    checked={color === 'blue'}
    onChange={() => setColor('blue')}
  />
</Column>

// Disabled radio
<Radio value="disabled" label="Disabled option" disabled />
```

**Radio Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Radio label |
| ...rest | - | - | All standard radio props |

**RadioGroup Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | - | Group name (required) |
| `value` | `string` | - | Selected value |
| `onChange` | `(value: string) => void` | - | Change handler |
| `direction` | `'horizontal' \| 'vertical'` | `'vertical'` | Layout direction |

---

#### Select

Single-value select dropdown.

```tsx
import { Select } from "@/components/Form/Select";

// Basic select
<Select
  label="Country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'pl', label: 'Poland' },
    { value: 'de', label: 'Germany' },
  ]}
  value={country}
  onChange={setCountry}
  placeholder="Select a country..."
  fullWidth
/>

// Searchable select
<Select
  label="Framework"
  options={[
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'angular', label: 'Angular' },
    { value: 'svelte', label: 'Svelte' },
  ]}
  value={framework}
  onChange={setFramework}
  searchable
  fullWidth
/>

// With disabled options
<Select
  label="Status"
  options={[
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'archived', label: 'Archived', disabled: true },
  ]}
  value={status}
  onChange={setStatus}
  fullWidth
/>

// With error
<Select
  label="Required Field"
  options={options}
  value={value}
  onChange={setValue}
  error="This field is required"
  fullWidth
/>

// With helper text
<Select
  label="Category"
  options={categories}
  value={category}
  onChange={setCategory}
  helperText="Choose the primary category"
  fullWidth
/>

// Disabled
<Select
  label="Locked Field"
  options={options}
  value="locked"
  disabled
  fullWidth
/>
```

**Select Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `SelectOption[]` | - | Array of options |
| `value` | `string` | - | Selected value |
| `onChange` | `(value: string) => void` | - | Change handler |
| `placeholder` | `string` | `'Select...'` | Placeholder text |
| `label` | `string` | - | Select label |
| `error` | `string` | - | Error message |
| `helperText` | `string` | - | Helper text |
| `disabled` | `boolean` | `false` | Disable select |
| `fullWidth` | `boolean` | `false` | Full width |
| `searchable` | `boolean` | `false` | Enable search |

**SelectOption:**

```tsx
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
```

---

#### MultiSelect

Multi-value select with tags.

```tsx
import MultiSelect from "@/components/Form/MultiSelect";

// Basic multi-select
<MultiSelect
  label="Technologies"
  options={[
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'angular', label: 'Angular' },
    { value: 'svelte', label: 'Svelte' },
    { value: 'solid', label: 'SolidJS' },
  ]}
  value={technologies}
  onChange={setTechnologies}
  placeholder="Select technologies..."
  fullWidth
/>

// Searchable
<MultiSelect
  label="Tags"
  options={allTags}
  value={selectedTags}
  onChange={setSelectedTags}
  searchable
  fullWidth
/>

// With max selection limit
<MultiSelect
  label="Choose up to 3"
  options={options}
  value={selected}
  onChange={setSelected}
  maxSelected={3}
  fullWidth
/>

// With error
<MultiSelect
  label="Required Tags"
  options={options}
  value={selected}
  onChange={setSelected}
  error="Select at least one tag"
  fullWidth
/>
```

**MultiSelect Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `SelectOption[]` | - | Array of options |
| `value` | `string[]` | `[]` | Selected values |
| `onChange` | `(value: string[]) => void` | - | Change handler |
| `placeholder` | `string` | `'Select...'` | Placeholder text |
| `label` | `string` | - | Select label |
| `error` | `string` | - | Error message |
| `helperText` | `string` | - | Helper text |
| `disabled` | `boolean` | `false` | Disable select |
| `fullWidth` | `boolean` | `false` | Full width |
| `searchable` | `boolean` | `false` | Enable search |
| `maxSelected` | `number` | - | Maximum selections |

---

### Loaders

#### Loader

Animated loading indicator.

```tsx
import { Box } from "@/components/Box/Box";
import Loader from "@/components/Loader/Loader";

// Default spinner
<Loader />

// Sizes
<Loader size="sm" />
<Loader size="md" />
<Loader size="lg" />
<Loader size="xl" />

// Variants
<Loader variant="spinner" />
<Loader variant="dots" />
<Loader variant="pulse" />
<Loader variant="bars" />

// With text
<Loader text="Loading..." />

// Custom color
<Loader color="#ff6b6b" />

// Centered in container
<Box style={{ height: '200px' }}>
  <Loader />
</Box>
```

**Loader Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Loader size |
| `variant` | `'spinner' \| 'dots' \| 'pulse' \| 'bars'` | `'spinner'` | Animation style |
| `color` | `string` | theme primary | Custom color |
| `text` | `string` | - | Loading text |
| `fullscreen` | `boolean` | `false` | Fullscreen overlay |
| `overlay` | `boolean` | `false` | Show overlay background |

---

#### Skeleton

Placeholder loading animation.

```tsx
import { Box } from "@/components/Box/Box"
import { Column } from "@/components/Layout/Column"
import { Row } from "@/components/Layout/Row"
import Skeleton from "@/components/Loader/Skeleton"

// Text skeleton
<Skeleton variant="text" width="60%" />
<Skeleton variant="text" width="80%" />
<Skeleton variant="text" width="40%" />

// Circular skeleton (avatar)
<Skeleton variant="circular" width="60px" height="60px" />

// Rectangular skeleton
<Skeleton variant="rectangular" width="100%" height="200px" />

// Animation variants
<Skeleton animation="wave" />   {/* Default shimmer */}
<Skeleton animation="pulse" />  {/* Pulsing */}
<Skeleton animation="none" />   {/* Static */}

// Custom border radius
<Skeleton width="100%" height="100px" borderRadius="12px" />

// Card skeleton example
<Box>
  <Row gap="16px">
    <Skeleton variant="circular" width="50px" height="50px" />
    <Column gap="8px" style={{ flex: 1 }}>
      <Skeleton variant="text" width="40%" height="16px" />
      <Skeleton variant="text" width="70%" />
      <Skeleton variant="text" width="50%" />
    </Column>
  </Row>
</Box>

// List skeleton
<Column gap="8px">
  {[1, 2, 3, 4, 5].map(i => (
    <Skeleton key={i} height="60px" />
  ))}
</Column>
```

**Skeleton Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'text' \| 'rectangular' \| 'circular'` | `'rectangular'` | Shape variant |
| `width` | `string` | - | Width |
| `height` | `string` | - | Height |
| `borderRadius` | `string` | - | Border radius |
| `animation` | `'wave' \| 'pulse' \| 'none'` | `'wave'` | Animation type |

---

#### PageLoader

Fullscreen loading overlay that freezes UI.

```tsx
import { Button } from "@/components/Button/Button";
import PageLoader from "@/components/Loader/PageLoader";
import { useState } from "react";

const [isLoading, setIsLoading] = useState(false);

// Basic usage
<PageLoader isLoading={isLoading} />

// With text
<PageLoader isLoading={isLoading} text="Loading application..." />

// Trigger example
<Button onClick={async () => {
  setIsLoading(true);
  await loadData();
  setIsLoading(false);
}}>
  Load Data
</Button>

<PageLoader isLoading={isLoading} text="Fetching data..." />
```

**PageLoader Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isLoading` | `boolean` | - | Show/hide loader |
| `text` | `string` | - | Loading message |

---

#### ContentLoader

Loading overlay for content sections.

```tsx
import { Box } from "@/components/Box/Box"
import { Column } from "@/components/Layout/Column"
import ContentLoader from "@/components/Loader/ContentLoader"
import Skeleton from "@/components/Loader/Skeleton"

// Basic usage
<ContentLoader isLoading={isFetching}>
  <DataTable data={data} />
</ContentLoader>

// With minimum height
<ContentLoader isLoading={isFetching} minHeight="200px">
  <CardGrid items={items} />
</ContentLoader>

// With text
<ContentLoader isLoading={isFetching} text="Loading content...">
  <Content />
</ContentLoader>

// In a Box
<Box title="User Data">
  <ContentLoader isLoading={isLoading}>
    {user && <UserProfile user={user} />}
  </ContentLoader>
</Box>

// With skeleton fallback
{isLoading ? (
  <Column gap="8px">
    <Skeleton height="40px" />
    <Skeleton height="40px" />
    <Skeleton height="40px" />
  </Column>
) : (
  <ContentLoader isLoading={isRefetching}>
    <DataList items={items} />
  </ContentLoader>
)}
```

**ContentLoader Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isLoading` | `boolean` | - | Show/hide loader |
| `children` | `ReactNode` | - | Content to wrap |
| `minHeight` | `string` | `'100px'` | Minimum height |
| `text` | `string` | - | Loading message |

---

## Hooks

### useGetData

Basic data fetching hook with loading, error states, and refetch capability.

```tsx
import { Button } from "@/components/Button/Button";
import { Select } from "@/components/Form/Select";
import { Column } from "@/components/Layout/Column";
import ContentLoader from "@/components/Loader/ContentLoader";
import Loader from "@/components/Loader/Loader";
import useGetData from "@/hooks/useGetData";
import { useState } from "react";

// Basic usage
const MyComponent = () => {
  const { data, isFetching, isError, error, refetch } = useGetData<User[]>({
    apiUrl: 'https://api.example.com/users',
    enabled: true,
  });

  if (isFetching) return <Loader />;
  if (isError) return <ErrorMessage error={error} onRetry={refetch} />;
  if (!data) return null;

  return (
    <Column gap="8px">
      {data.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
      <Button onClick={refetch}>Refresh</Button>
    </Column>
  );
};

// Conditional fetching
const UserProfile = ({ userId }: { userId: string | null }) => {
  const { data, isFetching } = useGetData<User>({
    apiUrl: `https://api.example.com/users/${userId}`,
    enabled: !!userId,  // Only fetch when userId exists
  });

  if (!userId) return <p>Select a user</p>;
  if (isFetching) return <Loader />;
  if (!data) return null;

  return <ProfileCard user={data} />;
};

// Dependent queries
const CategoryProducts = () => {
  const { data: categories } = useGetData<Category[]>({
    apiUrl: 'https://api.example.com/categories',
    enabled: true,
  });

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: products, isFetching } = useGetData<Product[]>({
    apiUrl: `https://api.example.com/products?category=${selectedCategory}`,
    enabled: !!selectedCategory,
  });

  return (
    <Column gap="16px">
      <Select
        label="Category"
        options={categories?.map(c => ({ value: c.id, label: c.name })) || []}
        value={selectedCategory || ''}
        onChange={setSelectedCategory}
      />
      <ContentLoader isLoading={isFetching}>
        {products && <ProductGrid products={products} />}
      </ContentLoader>
    </Column>
  );
};
```

**useGetData Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiUrl` | `string` | - | API endpoint URL |
| `enabled` | `boolean` | `true` | Enable/disable fetching |

**useGetData Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `data` | `T \| null` | Fetched data |
| `isFetching` | `boolean` | Loading state |
| `isError` | `boolean` | Error state |
| `isSuccess` | `boolean` | Success state |
| `isIdle` | `boolean` | Idle state (not started) |
| `error` | `Error \| null` | Error object |
| `refetch` | `() => Promise<void>` | Refetch function |

---

### useGetDataWithPolling

Data fetching with automatic polling.

```tsx
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Column } from "@/components/Layout/Column";
import { Row } from "@/components/Layout/Row";
import Loader from "@/components/Loader/Loader";
import useGetDataWithPolling from "@/hooks/useGetDataWithPolling";
import { Stats } from "fs";

const LiveDashboard = () => {
  const { 
    data, 
    isFetching, 
    stopPolling, 
    startPolling 
  } = useGetDataWithPolling<Stats>({
    apiUrl: 'https://api.example.com/stats',
    enabled: true,
    pollingInterval: 5000, // Poll every 5 seconds
  });

  return (
    <Box title="Live Statistics">
      <Column gap="16px">
        <Row justify="space-between">
          <span>Active Users: {data?.activeUsers}</span>
          {isFetching && <Loader size="sm" />}
        </Row>
        <Row gap="8px">
          <Button variant="secondary" onClick={stopPolling}>
            Stop Updates
          </Button>
          <Button onClick={startPolling}>
            Resume Updates
          </Button>
        </Row>
      </Column>
    </Box>
  );
};
```

**Additional Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `pollingInterval` | `number` | `0` | Polling interval in ms (0 to disable) |

**Additional Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `stopPolling` | `() => void` | Stop polling |
| `startPolling` | `() => void` | Start polling |

---

### useGetDataCached

Data fetching with caching support.

```tsx
import { Box } from "@/components/Box/Box";
import { IconButton } from "@/components/Box/styles";
import { Row } from "@/components/Layout/Row";
import ContentLoader from "@/components/Loader/ContentLoader";
import { Tooltip } from "@/components/Tooltip/Tooltip";
import { useGetDataCached } from "@/hooks/useGetDataCached";

const ProductList = () => {
  const { 
    data, 
    isFetching, 
    refetch, 
    clearCache 
  } = useGetDataCached<Product[]>({
    apiUrl: 'https://api.example.com/products',
    enabled: true,
    cacheTime: 5 * 60 * 1000,  // Cache valid for 5 minutes
    staleTime: 30 * 1000,       // Data considered fresh for 30 seconds
  });

  return (
    <Box 
      title="Products"
      headerActions={
        <Row gap="4px">
          <Tooltip content="Refresh data">
            <IconButton onClick={refetch}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip content="Clear cache">
            <IconButton onClick={clearCache}>
              <TrashIcon />
            </IconButton>
          </Tooltip>
        </Row>
      }
    >
      <ContentLoader isLoading={isFetching}>
        <ProductGrid products={data || []} />
      </ContentLoader>
    </Box>
  );
};
```

**Additional Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `cacheTime` | `number` | `300000` (5 min) | How long cache is valid |
| `staleTime` | `number` | `0` | How long data is considered fresh |

**Additional Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `clearCache` | `() => void` | Clear cached data |

---

## Theming

### Customizing the Theme

Modify `src/styles/theme.ts` to customize colors, spacing, and other design tokens:

```tsx
export const theme = {
  colors: {
    // Change primary color
    primary: '#10a37f',  // ChatGPT green
    primaryHover: '#1a7f64',
    primaryActive: '#145a49',
    
    // Add custom colors
    brand: '#ff6b6b',
    accent: '#4ecdc4',
    
    // Modify background
    background: '#343541',
    surface: '#444654',
    // ... etc
  },
  
  // Modify spacing scale
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  
  // ... other theme values
};
```

### Creating Theme Variants

```tsx
// src/styles/themes/light-theme.ts
import { theme as darkTheme } from '../theme';

export const lightTheme = {
  ...darkTheme,
  colors: {
    ...darkTheme.colors,
    background: '#ffffff',
    backgroundLight: '#f5f5f5',
    surface: '#ffffff',
    text: '#1a1a1a',
    textSecondary: '#666666',
    border: '#e0e0e0',
  },
};

// Usage in App.tsx
const [isDark, setIsDark] = useState(true);

<ThemeProvider theme={isDark ? darkTheme : lightTheme}>
  <App />
</ThemeProvider>
```

### Accessing Theme in Components

```tsx
import styled, { useTheme } from 'styled-components';

// In styled components
const StyledComponent = styled.div`
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacing.md};
`;

// In React components
const MyComponent = () => {
  const theme = useTheme();
  
  return (
    <div style={{ color: theme.colors.primary }}>
      Themed content
    </div>
  );
};
```

---

## License

MIT
