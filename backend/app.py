#!/usr/bin/env python3
import sqlite3
import json
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import cgi

class DatabaseManager:
    def __init__(self, db_path='etkinlik_db.sqlite'):
        self.db_path = db_path
    
    def get_connection(self):
        return sqlite3.connect(self.db_path)
    
    # SELECT işlemi
    def get_all_events(self):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, name, date, location, description, capacity, 
                   registered, price, category, organizer, image 
            FROM events ORDER BY date
        """)
        events = cursor.fetchall()
        conn.close()
        return events
    
    # SELECT işlemi - VIEW kullanımı (ödevde istenen)
    def get_event_summary(self):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM event_summary")
        summary = cursor.fetchall()
        conn.close()
        return summary
    
    # INSERT işlemi
    def add_event(self, event_data):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO events (name, date, location, description, capacity, 
                              price, category, organizer, image)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, event_data)
        event_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return event_id
    
    # UPDATE işlemi
    def update_event(self, event_id, event_data):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE events 
            SET name=?, date=?, location=?, description=?, capacity=?, 
                price=?, category=?, organizer=?, image=?
            WHERE id=?
        """, event_data + (event_id,))
        conn.commit()
        conn.close()
        return cursor.rowcount > 0
    
    # DELETE işlemi
    def delete_event(self, event_id):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM events WHERE id=?", (event_id,))
        conn.commit()
        conn.close()
        return cursor.rowcount > 0
    
    # Kullanıcı girişi (SELECT)
    def authenticate_user(self, username, password):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, username, email, name, role 
            FROM users 
            WHERE username=? AND password=?
        """, (username, password))
        user = cursor.fetchone()
        conn.close()
        return user
    
    # Etkinliğe katılım (INSERT - TRIGGER tetiklenir)
    def join_event(self, user_id, event_id):
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Zaten kayıtlı mı kontrol et
        cursor.execute("""
            SELECT id FROM user_events 
            WHERE user_id=? AND event_id=?
        """, (user_id, event_id))
        
        if cursor.fetchone():
            conn.close()
            return False, "Zaten kayıtlısınız"
        
        # Kapasite kontrol et
        cursor.execute("""
            SELECT capacity, registered FROM events WHERE id=?
        """, (event_id,))
        event_info = cursor.fetchone()
        
        if not event_info or event_info[1] >= event_info[0]:
            conn.close()
            return False, "Etkinlik dolu"
        
        # Katılımı kaydet (TRIGGER otomatik çalışır)
        cursor.execute("""
            INSERT INTO user_events (user_id, event_id) 
            VALUES (?, ?)
        """, (user_id, event_id))
        
        conn.commit()
        conn.close()
        return True, "Başarıyla kaydoldunuz"

# Test fonksiyonu
def test_database():
    db = DatabaseManager()
    
    print("=== VERİTABANI TEST ===")
    
    # SELECT test
    print("\n1. Tüm etkinlikler (SELECT):")
    events = db.get_all_events()
    for event in events:
        print(f"   {event[1]} - {event[2]}")
    
    # VIEW test
    print("\n2. Etkinlik özeti (VIEW):")
    summary = db.get_event_summary()
    for row in summary:
        print(f"   {row[0]} - %{row[4]} dolu")
    
    # INSERT test
    print("\n3. Yeni etkinlik ekleme (INSERT):")
    new_event = ("Test Etkinliği", "1 Temmuz 2025", "Test Lokasyon", 
                 "Test açıklama", 100, 25, "Test", "TestOrg", "🎯")
    event_id = db.add_event(new_event)
    print(f"   Yeni etkinlik ID: {event_id}")
    
    # UPDATE test
    print("\n4. Etkinlik güncelleme (UPDATE):")
    updated_event = ("Güncellenmiş Test", "2 Temmuz 2025", "Yeni Lokasyon", 
                     "Güncellenmiş açıklama", 150, 30, "Test", "TestOrg", "🎯")
    success = db.update_event(event_id, updated_event)
    print(f"   Güncelleme başarılı: {success}")
    
    # Authentication test
    print("\n5. Kullanıcı girişi (SELECT):")
    user = db.authenticate_user("admin", "admin123")
    if user:
        print(f"   Giriş başarılı: {user[3]} ({user[4]})")
    
    # JOIN test (TRIGGER tetiklenir)
    print("\n6. Etkinliğe katılım (INSERT + TRIGGER):")
    success, message = db.join_event(1, 1)
    print(f"   Katılım: {message}")
    
    # DELETE test
    print("\n7. Etkinlik silme (DELETE):")
    success = db.delete_event(event_id)
    print(f"   Silme başarılı: {success}")
    
    print("\n=== TEST TAMAMLANDI ===")

if __name__ == "__main__":
    test_database()
