# Guideline

Guideline écrit pour les humains : les règles que l'IA doit suivre dans le process de développement IT, et nos principes généraux pour coder et organiser le travail. L'IA en prend aussi connaissance et l'applique.

Ce guideline est la source de vérité. Tout autre document le détaille, sans ajouter de règle ni le contredire.

## Glossaire

[1. Technique](#1-technique)

[1.1 Code](#11-code)

[1.2 Architecture](#12-architecture)

[1.3 Vérification automatique](#13-vérification-automatique)

[1.4 Technologies de base](#14-technologies-de-base)

[2. Workflow](#2-workflow)

## 1. Technique

Les règles d'architecture, de code et de technologies à respecter.

### 1.1 Code

[code.md](code.md)

### 1.2 Architecture

[architecture.md](architecture.md)

### 1.3 Vérification automatique

[verification.md](verification.md)

### 1.4 Technologies de base

- **Langage** : TypeScript
- **Tests** : Vitest, `happy-dom`, `@testing-library/user-event`
- **Qualité** : ESLint, Prettier
- **Schémas** : Zod
- **API** : Express
- **Front** : React, Storybook

Une autre technologie peut s'ajouter selon le projet. Remplacer l'une de celles-ci, c'est à l'utilisateur de le trancher.

## 2. Workflow

Les règles pour travailler : création de branche, où travailler, et comment.

[workflow.md](workflow.md)
