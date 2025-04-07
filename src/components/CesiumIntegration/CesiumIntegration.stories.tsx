// CesiumIntegration.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import CesiumIntegration from './CesiumIntegration';
import React from 'react';

const meta = {
  title: 'Components/CesiumIntegration',
  component: CesiumIntegration,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof CesiumIntegration>;

export default meta;
type Story = StoryObj<typeof CesiumIntegration>;

export const Default: Story = {
  render: () => (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <CesiumIntegration />
    </div>
  ),
};