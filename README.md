# Catalyst Demo

To run the Catalyst demo, first install the npm dependencies:

```bash
npm install
```

Next, run the development server:

```bash
npm run dev
```

Finally, open [http://localhost:3000](http://localhost:3000) in your browser to view the website.

If `npm run lint` or other scripts fail with errors such as `next: not found` or
"Module not found: Can't resolve '@fullcalendar/react'", ensure that all
dependencies are installed:

```bash
npm install
```

The FullCalendar packages are listed in `package.json`. If you installed
dependencies before they were added, run `npm install` again or add them
explicitly:

```bash
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
```

Ensure your environment has network access to the npm registry so these
packages can be downloaded successfully.
