{
  "pipe": "ListDir|ReFilter|Duplicate|Replace|RenameFile|Null",
  "dir": "/mnt/storage/down/jd/Downloads",
  "ListDirConfig": {
    "fullPath": true
  },
  "ReFilterConfig": {
    "property": "file",
    "pattern": ".*"
  },
  "DuplicateConfig": {
    "property": "file",
    "newName": "dest"
  },
  "ReplaceConfig": {
    "property": "dest",
    "pattern": [ "\\[WwW\\.VoirFilms\\.co\\]-", "i" ],
    "newSubstr": ""
    }
  }
}
