# Repository Specification: `{repo-name}`

> **Belongs to Product**: [`{product-name}`](../../../products/{product-name}/prd.md)  
> **Repository URL**: [`https://github.com/fromsukong/{repo-name}`](https://github.com/fromsukong/{repo-name})  
> **Visibility**: Public  
> **Maintainer**: @fromsukong  

---

## 1. Description & Scope
Replace me: what this repository is for, what it does, and its boundaries within the `@fromsukong` ecosystem.

---

## 2. Tech Stack & Environment
- **Language**: TBD
- **Package Manager**: TBD
- **Runtime**: TBD

---

## 3. Directory Structure
```
{repo-name}/
├── product/       # Spec (synced into products-dev via sparse submodule)
└── src/           # Source code
```

---

## 4. Integration Contracts
- **Products-dev**: registered as a sparse submodule at `products-dev/repos/{repo-name}` (checks out `product/` only).
