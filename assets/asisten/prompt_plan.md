    ## **Creating Prompts for Code-Generation LLM**
    
    Below are the prompts for each step, formatted with code tags using Markdown. Each prompt builds upon the previous steps and ensures all code is integrated.
    
    ---
    
    ### **Prompt for Step 2: Initialize the Project**
    
    ```text
    Please create a new Vite project using React and TypeScript. Open a terminal and run `npm create vite@latest`. When prompted, name the project "idea-storage-app" and select the React and TypeScript template. Navigate into the project directory and install dependencies with `npm install`. Initialize a Git repository with `git init`, add all files with `git add .`, and make the initial commit with the message "Initial commit".
    ```
    
    ---
    
    ### **Prompt for Step 3: Set Up Tailwind CSS**
    
    ```text
    In the "idea-storage-app" project, set up Tailwind CSS. Install Tailwind CSS and its dependencies by running `npm install -D tailwindcss postcss autoprefixer`. Initialize Tailwind by running `npx tailwindcss init -p`. In `tailwind.config.js`, set the `content` array to `["./index.html", "./src/**/*.{ts,tsx}"]`. In the `src` directory, create a new `index.css` file if it doesn't exist, and add the Tailwind directives:
    
    ```css
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    ```
    
    Ensure that `index.css` is imported in your main application file.
    
    ```
    
    ---
    
    ### **Prompt for Step 4: Build the Basic Application Structure**
    
    ```text
    In the project, remove unnecessary files from the Vite template, such as default logos and styles. Create a `components` directory inside `src`. Within `components`, create two new files: `MainPage.tsx` and `IdeaCard.tsx`. Update `App.tsx` to import and render the `MainPage` component. Ensure that the application runs without errors by starting the development server with `npm run dev`.
    ```
    
    ---
    
    ### **Prompt for Step 5: Implement the Idea Input Form**
    
    ```text
    In `MainPage.tsx`, implement an idea input form. Inside the `MainPage` component, add a `<form>` element containing:
    
    - A text `<input>` field with the placeholder "Enter your idea here..." and appropriate Tailwind CSS classes for styling.
    - A submit `<button>` labeled "Add Idea", also styled with Tailwind CSS.
    
    Use React's `useState` hook to manage the state of the input field. Implement a `handleSubmit` function that:
    
    - Prevents the default form submission behavior.
    - Adds the new idea to a list of ideas.
    - Clears the input field after submission.
    
    Ensure the form calls `handleSubmit` on submission.
    ```
    
    ---
    
    ### **Prompt for Step 6: Implement LocalStorage Functionality**
    
    ```text
    Create a custom hook named `useLocalIdeasStorage` in a new `hooks` directory inside `src`. This hook should:
    
    - Use `useState` to manage the list of ideas.
    - On initialization, load any existing ideas from `localStorage` and set them in state.
    - Provide a function `addIdea` to add a new idea to the list and save it to `localStorage`.
    - Use `useEffect` to update `localStorage` whenever the list of ideas changes.
    
    In `App.tsx`, replace the local state management for ideas with this custom hook. Update `handleSubmit` to use `addIdea` from the hook to add new ideas.
    ```
    
    ---
    
    ### **Prompt for Step 7: Implement the Idea Display Area**
    
    ```text
    In `MainPage.tsx`, after the idea input form, display the list of ideas. Map over the list of ideas obtained from `useLocalIdeasStorage` and render an `IdeaCard` for each. Pass the idea text as a prop to `IdeaCard`.
    
    In `IdeaCard.tsx`, accept the idea text as a prop and display it within a styled card. Use Tailwind CSS classes to style the card with a neo-brutalist design, incorporating elements like bold borders, high-contrast colors, and simple typography. Ensure that the idea cards appear beneath the input form and are visually separated.
    ```
    
    ---
    
    ### **Prompt for Step 8: Implement Real-Time Search Functionality**
    
    ```text
    In `MainPage.tsx`, add a search `<input>` field above the list of ideas with the placeholder "Search ideas..." and style it appropriately with Tailwind CSS. Use `useState` to manage the search term state. Implement a function that filters the list of ideas based on the search term, updating the displayed ideas in real-time as the user types.
    
    Ensure that the filtering is case-insensitive and matches any part of the idea text. When the search field is empty, all ideas should be displayed. Test the search functionality to confirm it works smoothly without performance issues.
    ```
    
    ---
    
    ### **Prompt for Step 9: Apply Neo-Brutalist Styling**
    
    ```text
    Apply neo-brutalist styling to the entire application using Tailwind CSS, ensuring a minimalist, light theme. In particular:
    
    - **Input Fields and Buttons:**
    - Use simple, solid colors with high contrast.
    - Apply thick borders and sharp edges (no border-radius).
    - Use bold, sans-serif fonts for text.
    - **Idea Cards:**
    - Maintain a consistent card size.
    - Use minimal decoration—focus on content.
    - Implement hover effects that align with neo-brutalist aesthetics.
    - **Layout:**
    - Ensure elements are aligned and spaced consistently.
    - Design with a mobile-first approach, making sure the app looks good on small screens.
    - Use responsive utility classes in Tailwind CSS to adjust styles for larger screens.
    
    Review and adjust the styles as necessary to maintain visual consistency and adhere to neo-brutalist principles.
    ```
    
    ---
    
    ### **Prompt for Step 10: Testing and Deployment Preparation**
    
    ```text
    Perform thorough testing of the application:
    
    - **Functionality Testing:**
    - Test adding ideas, ensuring they appear in the list and are saved to `localStorage`.
    - Test the search functionality with various input cases.
    - Verify that ideas persist after refreshing the page.
    - **Responsive Design Testing:**
    - Use browser developer tools to test the app on different screen sizes.
    - Ensure that the layout adapts correctly on mobile, tablet, and desktop views.
    - **Cross-Browser Testing:**
    - Check compatibility with modern browsers like Chrome, Firefox, Safari, and Edge.
    
    Fix any issues discovered during testing. Once satisfied, prepare the app for deployment:
    
    - Build the production version of the app using `npm run build`.
    - Choose a deployment platform like Netlify or Vercel.
    - Follow the platform's instructions to deploy the app, ensuring that all environment configurations are correctly set.
    - Test the deployed app to confirm it works as expected in the live environment.
    ```
