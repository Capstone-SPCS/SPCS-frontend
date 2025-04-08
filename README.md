# SPCS Frontend

## Project Overview

This is a React-based frontend application built with TypeScript, utilizing modern web technologies and tools for visualization and real-time data handling.

## Tech Stack

- **Core Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM v7
- **Styling**: CSS with shadcn/ui components
- **Data Visualization**: D3.js, Cesium/Resium for 3D visualization
- **Real-time Communication**: Socket.IO
- **Backend Communication**: Axios, GraphQL
- **Database Integration**: Supabase
- **Testing**: Jest with React Testing Library
- **Component Development**: Storybook
- **Build Tool**: Create React App with TypeScript

## Project Structure

### Root Directory

```
/
├── src/               # Source code
├── public/           # Static assets
├── .storybook/       # Storybook configuration
├── node_modules/     # Dependencies
├── package.json      # Project configuration and dependencies
└── tsconfig.json     # TypeScript configuration
```

### Source Code Organization (`/src`)

```
src/
├── apiClient/        # API client configurations and services
├── components/       # Reusable React components
├── utils/           # Utility functions and helpers
├── redux/           # Redux store, actions, and reducers
├── supabase/        # Supabase client and related functions
├── hooks/           # Custom React hooks
├── types/           # TypeScript type definitions
├── pages/           # Page components and routing
└── main/            # Main application setup
```

## Key Directories and Their Purposes

### 1. `/src/components`

Contains reusable React components. Components should be:

- Modular and reusable
- Well-documented with TypeScript types
- Accompanied by Storybook stories when applicable

### 2. `/src/pages`

Contains page-level components that correspond to different routes in the application.

### 3. `/src/redux`

Houses Redux-related code:

- Store configuration
- Slices for different features
- Actions and reducers
- State selectors

### 4. `/src/apiClient`

Contains API integration code:

- API client configuration
- Service functions for making API calls
- Request/response types

### 5. `/src/supabase`

Manages Supabase integration:

- Client configuration
- Database queries
- Authentication functions

### 6. `/src/hooks`

Custom React hooks for:

- Shared logic
- State management
- Side effects

### 7. `/src/utils`

Utility functions and helpers:

- Helper functions
- Constants
- Shared logic

### 8. `/src/types`

TypeScript type definitions:

- Shared interfaces
- Type declarations
- Enums

## Environment Variables

The following environment variables are required for the application to function properly. Create a `.env` file in the root directory with these variables:

```env
# Cesium Ion token for 3D visualization
REACT_APP_CESIUM_TOKEN=your_cesium_token_here

# Supabase configuration
REACT_APP_SUPABASE_KEY=your_supabase_anon_key
REACT_APP_SUPABASE_URL=your_supabase_project_url

# Backend API URL
REACT_APP_EXPRESS_URL=your_backend_api_url
```

## Development Workflow

### 1. Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Start Storybook
npm run storybook
```

### 2. Testing

- Jest and React Testing Library for unit and integration tests
- Test files located alongside components
- Run tests with `npm test`

### 3. Component Development

- Use Storybook for component development and documentation
- Run Storybook with `npm run storybook`
- Stories should be created for all reusable components

### 4. Building for Production

```bash
# Create production build
npm run build

# Build Storybook documentation
npm run build-storybook
```

## Best Practices

### 1. Code Organization

- Keep components small and focused
- Use TypeScript for type safety
- Follow the established project structure

### 2. State Management

- Use Redux for global state
- Local state with useState/useReducer
- Custom hooks for complex state logic

### 3. Testing

- Write tests for all new components
- Maintain good test coverage
- Use meaningful test descriptions

### 4. Performance

- Implement code splitting where necessary
- Use React.memo for expensive components
- Optimize re-renders with useMemo and useCallback

## Additional Resources

- React Documentation: https://react.dev
- Redux Toolkit: https://redux-toolkit.js.org
- Supabase Documentation: https://supabase.com/docs
- D3.js Documentation: https://d3js.org
- Cesium Documentation: https://cesium.com/learn/
