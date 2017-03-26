{
  "pipe": "ListDir|ReFilter|Duplicate|Replace#1|Replace#2|RenameFile|Null",
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
  "ReplaceConfig#1": {
    "property": "dest",
    "pattern": [ "\\[WwW.VoirFilms.co\\]-", "i" ],
    "newSubstr": ""
  },
  "ReplaceConfig#2": {
    "property": "dest",
    "pattern": [ "WwW.VoirFilms.co-", "i" ],
    "newSubstr": ""
  }
}
