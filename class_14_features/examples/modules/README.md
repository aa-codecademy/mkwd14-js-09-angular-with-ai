# 02 — NgModule (non-standalone) project structure

A classic, pre-standalone Angular app. Nothing here uses `standalone: true` —
every component, directive and pipe is declared by an NgModule.

## Module map

```
AppModule                     root module — bootstraps AppComponent
├── AppRoutingModule          RouterModule.forRoot(), lazy-loads features
├── CoreModule                app-wide singletons + HeaderComponent (imported once)
├── SharedModule              CardComponent, TruncatePipe, HighlightDirective (imported many times)
├── ProductsModule  (lazy)    ProductListComponent, ProductDetailComponent
│   └── ProductsRoutingModule RouterModule.forChild()
└── OrdersModule    (lazy)    OrderListComponent, OrderDetailComponent, OrderStatusDirective
    └── OrdersRoutingModule   RouterModule.forChild()
```

## Points to make to students

- `main.ts` uses `platformBrowser().bootstrapModule(AppModule)`, not `bootstrapApplication()`.
- `declarations` = what a module owns; `imports` = what it borrows; `exports` = what it lends out.
- A component can only use another component if its module declares or imports it — this is what standalone components replaced.
- **CoreModule** holds `providers` (singleton services) and is imported once by `AppModule`; the `@SkipSelf()` constructor guard enforces that.
- **SharedModule** has no providers, re-exports `CommonModule`/`FormsModule`/`RouterModule`, and is imported by every feature module.
- Feature modules are lazy-loaded with `loadChildren: () => import(...)`, and use `forChild()` for their routes.
- `OrderStatusDirective` is declared but not exported by `OrdersModule` — a feature module can keep declarables private.

## Run

```bash
npm install
ng serve
```
