import type { Dependencies } from "../services/di";
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router";

export const Route = createRootRouteWithContext<{ dependencies: Dependencies }>()({
  head: () => {
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "CU Archi — Todo list" },
      ],
    };
  },

  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
