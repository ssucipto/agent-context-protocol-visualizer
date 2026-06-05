import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock IntersectionObserver (not available in jsdom)
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();
class MockIntersectionObserver {
  observe = mockObserve;
  disconnect = mockDisconnect;
  unobserve = vi.fn();
  constructor() {}
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

// Mock the server functions used by DocsViewer
vi.mock('../../server/routes/api/docs', () => ({
  listDocs: vi.fn().mockResolvedValue({
    files: [
      { name: 'README', path: 'README.md', dir: 'Root' },
      { name: 'audit-1-test', path: 'agent/reports/audit-1-test.md', dir: 'Reports' },
      { name: 'architecture', path: 'agent/wiki/architecture.md', dir: 'Wiki' },
    ],
  }),
  readDoc: vi.fn().mockResolvedValue({
    content: `# Test Document\n\nThis is a **test** markdown document.\n\n## Table\n\n| Col1 | Col2 |\n|------|------|\n| A | B |\n\n\`\`\`mermaid\ngraph TD\n  A-->B\n\`\`\``,
    path: 'README.md',
    error: null,
  }),
}));

// Mock mermaid
const mockMermaidRender = vi.fn().mockResolvedValue({ svg: '<svg>mock</svg>' });
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: mockMermaidRender,
  },
}));

// Mock window.print
const mockPrint = vi.fn();
vi.stubGlobal('print', mockPrint);

// Mock URL.createObjectURL
const mockCreateObjectURL = vi.fn(() => 'blob:mock');
vi.stubGlobal('URL', { ...URL, createObjectURL: mockCreateObjectURL });

import { DocsViewer } from '../../src/components/DocsViewer';

describe('DocsViewer component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders document list sidebar', async () => {
    render(<DocsViewer />);

    // Wait for loading to finish
    expect(await screen.findByText('Root (1)')).toBeInTheDocument();
    expect(screen.getByText('Reports (1)')).toBeInTheDocument();
    expect(screen.getByText('Wiki (1)')).toBeInTheDocument();
  });

  it('shows drop zone placeholder when no document selected', async () => {
    render(<DocsViewer />);

    expect(
      await screen.findByText(/Drop a/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/or select a document/i)).toBeInTheDocument();
  });

  it('renders markdown content when a document is selected', async () => {
    const user = userEvent.setup();
    render(<DocsViewer />);

    // Click on README
    const readmeBtn = await screen.findByText('README');
    await user.click(readmeBtn);

    // Should render markdown as HTML (heading + TOC entry both have the text)
    expect(await screen.findAllByText('Test Document')).toHaveLength(2);
  });

  it('renders tables in markdown content', async () => {
    const user = userEvent.setup();
    render(<DocsViewer />);

    const readmeBtn = await screen.findByText('README');
    await user.click(readmeBtn);

    // Table should be wrapped in .table-wrapper
    expect(await screen.findByText('Col1')).toBeInTheDocument();
    expect(screen.getByText('Col2')).toBeInTheDocument();
  });

  it('renders mermaid diagrams after content loads', async () => {
    const user = userEvent.setup();
    render(<DocsViewer />);

    const readmeBtn = await screen.findByText('README');
    await user.click(readmeBtn);

    // Mermaid should be called to render the diagram
    await vi.waitFor(() => {
      expect(mockMermaidRender).toHaveBeenCalled();
    });
  });

  it('shows mermaid loading state briefly', async () => {
    // Make mermaid render take a moment
    mockMermaidRender.mockImplementationOnce(() =>
      new Promise(r => setTimeout(() => r({ svg: '<svg>delayed</svg>' }), 100))
    );

    const user = userEvent.setup();
    render(<DocsViewer />);
    const readmeBtn = await screen.findByText('README');
    await user.click(readmeBtn);

    // Loading indicator should appear
    expect(await screen.findByText('🔄 Rendering diagram…')).toBeInTheDocument();
  });

  it('shows mermaid error fallback on render failure', async () => {
    mockMermaidRender.mockRejectedValueOnce(new Error('Parse error'));

    const user = userEvent.setup();
    render(<DocsViewer />);
    const readmeBtn = await screen.findByText('README');
    await user.click(readmeBtn);

    expect(await screen.findByText(/Diagram rendering failed/)).toBeInTheDocument();
  });

  it('shows export buttons when document selected', async () => {
    const user = userEvent.setup();
    render(<DocsViewer />);

    const readmeBtn = await screen.findByText('README');
    await user.click(readmeBtn);

    // Export buttons should appear
    expect(await screen.findByTitle('Export to Word')).toBeInTheDocument();
    expect(screen.getByTitle('Export to PDF')).toBeInTheDocument();
  });

  it('triggers print on PDF export click', async () => {
    const user = userEvent.setup();
    render(<DocsViewer />);

    const readmeBtn = await screen.findByText('README');
    await user.click(readmeBtn);

    const pdfBtn = await screen.findByTitle('Export to PDF');
    await user.click(pdfBtn);

    expect(mockPrint).toHaveBeenCalled();
  });
});
