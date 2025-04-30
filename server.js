/ajouter-memoire:
  post:
    operationId: ajouterMemoire
    summary: Ajouter un souvenir à la mémoire d’Alice
    security:
      - apiKeyHeader: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              date:
                type: string
                format: date-time
                example: 2025-04-30T10:00:00Z
              titre:
                type: string
                example: Naissance de la mémoire
              contenu:
                type: string
                example: Activation initiale de la mémoire contextuelle dans GPTPortail.
            required:
              - date
              - titre
              - contenu
    responses:
      '200':
        description: Souvenir ajouté avec succès
        content:
          application/json:
            schema:
              type: object
              properties:
                statut:
                  type: string
                  example: succès
      '403':
        description: Non autorisé (clé API manquante ou invalide)
      '500':
        description: Erreur serveur
