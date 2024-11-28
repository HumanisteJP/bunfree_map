import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import {
  CssBaseline,
  TextField,
  Typography,
  Card,
  CardContent,
  Container,
  Box,
  Link,
  IconButton,
  Modal,
  Backdrop,
  Fade,
  Stack,
  FormControlLabel,
  Switch,
  Snackbar,
  Alert
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const App = () => {
  const [booths, setBooths] = useState([]);
  const [filteredBooths, setFilteredBooths] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false); // モーダルの開閉状態
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbarの開閉状態
  const [enableDetailSearch, setEnableDetailSearch] = useState(false); // 詳細検索の有効化
  const cardRefs = useRef({}); // 各カードの参照を保持

  // URLクエリから検索クエリを取得
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q")?.toLowerCase() || ""; // q パラメータを取得
    setSearchQuery(query);
  }, []);

  // JSONデータを読み込む
  useEffect(() => {
    const fetchBoothData = async () => {
      try {
        const response = await fetch("/booth.json");
        const data = await response.json();
        setBooths(data);

        // 検索クエリが既に設定されている場合は検索を実行
        if (searchQuery) {
          const filtered = data.filter((booth) =>
            booth.name?.toLowerCase().includes(searchQuery) ||
            booth.yomi_of_name?.toLowerCase().includes(searchQuery) ||
            booth.category?.toLowerCase().includes(searchQuery) ||
            booth.twitter?.toLowerCase().includes(searchQuery) ||
            enableDetailSearch && booth.detail?.toLowerCase().includes(searchQuery) ||
            booth.instagram?.toLowerCase().includes(searchQuery)
          );
          setFilteredBooths(filtered);
        }
      } catch (error) {
        console.error("JSONデータの読み込みに失敗しました", error);
      }
    };

    fetchBoothData();
  }, [searchQuery, enableDetailSearch]);

  // 検索処理
  const handleSearch = () => {
    if (searchQuery === "" || searchQuery === "@") {
      setFilteredBooths([]);
      return;
    }

    const filtered = booths.filter((booth) => {
      return (
        booth.name?.toLowerCase().includes(searchQuery) ||
        booth.yomi_of_name?.toLowerCase().includes(searchQuery) ||
        booth.category?.toLowerCase().includes(searchQuery) ||
        booth.twitter?.toLowerCase().includes(searchQuery) ||
        enableDetailSearch && booth.detail?.toLowerCase().includes(searchQuery) ||
        booth.instagram?.toLowerCase().includes(searchQuery)
      );
    });

    setFilteredBooths(filtered);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch(); // エンターキーで検索を実行
    }
  };

  const handleMarkerClick = (boothId) => {
    const targetRef = cardRefs.current[boothId];
    if (targetRef) {
      targetRef.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // モーダルの開閉
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleChange = (event) => {
    setEnableDetailSearch(event.target.checked);
  };

  // リンクをクリップボードにコピー
  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      setSnackbarOpen(true); // Snackbarを開く
    });
  };

  // Snackbarの閉じる処理
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <CssBaseline />
      <div className="App" style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "center", minHeight: "100vh" }}>
        <Container sx={{
          maxWidth: 640,
          display: 'flex',
          justifyContent: 'center'
        }}>
          <Stack spacing={2} maxWidth={640} width={"100%"}>
            <Box>
              <Box display="flex" justifyContent="flex-end" alignItems="center">
                <IconButton onClick={handleOpen}>
                  <HelpOutlineIcon />
                </IconButton>
              </Box>
              <Box display="flex" justifyContent="center">
                <Typography variant="h5" gutterBottom>
                  文学フリマ東京39 ブース検索サイト
                </Typography>
              </Box>
            </Box>

            <Typography variant="body1" gutterBottom>
              <Link
                href={`https://bunfree.net/event/tokyo39/`}
                target="_blank"
                rel="noopener noreferrer"
              >
                文学フリマ東京39
              </Link>
              のブースの位置情報をブース名、カテゴリ、SNSから検索できます。
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="名前、カテゴリ、SNSアカウントで検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
              onKeyDown={handleKeyDown}
              onBlur={handleSearch}
              style={{ marginBottom: "20px" }}
            />

            {/* 地図エリア */}
            <div id="map-container">
              {filteredBooths.map((booth) => (
                <div
                  key={booth.id}
                  className="marker"
                  style={{
                    left: `${booth.x * 100}%`,
                    top: `${booth.y * 100}%`,
                  }}
                  onClick={() => handleMarkerClick(booth.id)}
                  title={booth.name}
                ></div>
              ))}
            </div>

            {/* 検索結果リスト */}
            <Box mt={4} maxWidth={640}>
              {filteredBooths.map((booth) => (
                <Card
                  key={booth.id}
                  ref={(el) => (cardRefs.current[booth.id] = el)} // 各カードの参照を設定
                  style={{ marginBottom: "15px", padding: "10px", maxWidth: 640 }}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">
                        <Link href={booth.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {booth.name}
                        </Link>
                      </Typography>
                      <IconButton
                        onClick={() => handleCopyLink(window.location.origin + `?q=${booth.name}`)}
                        title="地図のリンクをコピー"
                      >
                        <ContentCopyIcon />
                      </IconButton>
                    </Box>
                    <Typography variant="body2">カテゴリ: {booth.category}</Typography>
                    <Typography variant="body2">
                      エリア: {booth.area} / {booth.area_number}
                    </Typography>
                    <Typography variant="body2">{booth.detail}</Typography>
                    {booth.twitter && (
                      <Typography variant="body2">
                        X (Twitter)：
                        <Link
                          href={`https://x.com/${booth.twitter.slice(1)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {booth.twitter}
                        </Link>
                      </Typography>
                    )}
                    {booth.instagram && (
                      <Typography variant="body2">
                        Instagram：
                        <Link
                          href={`https://www.instagram.com/${booth.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {booth.instagram}
                        </Link>
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Stack>
        </Container>
      </div>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }} // 右下に配置
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: "100%" }}>
          地図のリンクをコピーしました！
        </Alert>
      </Snackbar>
    </>
  );
};

export default App;
