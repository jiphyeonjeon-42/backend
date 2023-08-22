rg -U 'DROP TABLE IF EXISTS (.|\n)*?\).*?;\n*?/\*.*?\*/;' ./backup.sql > tables.sql
