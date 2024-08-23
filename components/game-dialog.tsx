import React from "react";

import "./game-dialog.css";

interface GameDialogProps {
  title: string;
  coverImageUrl: string;
  isDialogOpen: boolean;
  onClose: () => void;
}

const GameDialog: React.FC<GameDialogProps> = ({
  title,
  coverImageUrl,
  isDialogOpen,
  onClose,
}) => {
  if (!isDialogOpen) return null;

  return (
    <div className="dialog">
      <div className="dialog-content">
        <div className="content-left">
          <h2>{title}</h2>
          <img src={coverImageUrl} alt={title} className="mb-4" />
        </div>
        <div className="content-right">
          <div className="dialog-form">
            <form action="/api/games" method="post">
              <label htmlFor="price">Hinta:</label>
              <input type="number" id="price" name="price" min="0" />
              <br />
              <label htmlFor="store">Kauppa:</label>
              <input type="text" id="store" name="store" />
              <br />
              <label htmlFor="description">Kuvaus:</label>
              <textarea id="description" name="description" />
              <br />
              <label htmlFor="link">Linkki:</label>
              <input type="url" id="link" name="link" />
              <br />
              <label htmlFor="players">Pelaajamäärä:</label>
              <input
                type="number"
                id="players"
                name="players"
                min="1"
                max="20"
              />
              <br />
              <label htmlFor="isLan">LAN-peli:</label>
              <input type="checkbox" id="isLan" name="isLan" />
              <br />
              <br />
              <input type="submit" value="Lisää peli" />
            </form>
          </div>
        </div>

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default GameDialog;
