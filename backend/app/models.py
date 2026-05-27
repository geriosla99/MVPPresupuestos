"""
[OBSOLETO] Contenía los modelos SQLAlchemy (User, Transaction, Goal, BudgetItem).
Tras migrar a Firebase Firestore (NoSQL), la estructura ahora vive directamente
como colecciones y subcolecciones en `app/firebase.py`. Este archivo se mantiene
vacío únicamente para no romper imports históricos; puede eliminarse.
"""
