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
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CloseIcon from "@mui/icons-material/Close";

const App = () => {
  const [booths, setBooths] = useState([]);
  const [filteredBooths, setFilteredBooths] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false); // モーダルの開閉状態
  const cardRefs = useRef({}); // 各カードの参照を保持

  // JSONデータを読み込む
  useEffect(() => {
    const fetchBoothData = async () => {
      try {
        const response = await fetch("/booth.json");
        const data = await response.json();
        setBooths(data);
      } catch (error) {
        console.error("JSONデータの読み込みに失敗しました", error);
      }
    };

    fetchBoothData();
  }, []);

  // 検索処理
  const handleSearch = () => {
    if (searchQuery === "" || searchQuery === "@") {
      setFilteredBooths([]);
      return;
    }

    const filtered = booths.filter((booth) => {
      return (
        booth.name?.toLowerCase().includes(searchQuery) ||
        booth.category?.toLowerCase().includes(searchQuery) ||
        booth.twitter?.toLowerCase().includes(searchQuery) ||
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

  return (
    <>
      <CssBaseline />
      <div className="App" style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "center", minHeight: "100vh" }}>
        <Container sx={{ maxWidth: 840 }}>
          <Stack spacing={2}>
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
              のブースの位置情報をブース、ジャンル、SNSから検索できます。
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="名前、カテゴリ、SNSアカウントで検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
              onKeyDown={handleKeyDown} // キー入力イベントを追加
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
            <Box mt={4}>
              {filteredBooths.map((booth) => (
                <Card
                  key={booth.id}
                  ref={(el) => (cardRefs.current[booth.id] = el)} // 各カードの参照を設定
                  style={{ marginBottom: "15px", padding: "10px" }}
                >
                  <CardContent>
                    <Typography variant="h6">
                      <Link href={booth.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {booth.name}
                      </Link>
                    </Typography>
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

      {/* フッター */}
      <footer style={{ marginTop: "40px", padding: "20px", backgroundColor: "#f8f9fa", textAlign: "center" }}>
        <Typography variant="body2">
          作った人：
          <Link href="https://x.com/humanistejp" target="_blank" rel="noopener noreferrer">
            @humanistejp
          </Link>
        </Typography>
        <Typography variant="body2">
          GitHub リポジトリ：
          <Link href="https://github.com/HumanisteJP/bunfree_map/" target="_blank" rel="noopener noreferrer">
            https://github.com/HumanisteJP/bunfree_map/
          </Link>
        </Typography>
        <Typography variant="body2">
          © 2024 humanistejp. All rights reserved.
        </Typography>
      </footer>
    </>
  );
};

export default App;
