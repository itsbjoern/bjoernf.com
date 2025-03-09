import * as THREE from "three";
import { createRectangleWithRoundedEdges } from "./helpers";

const colors = [
  "141204",
  "262a10",
  "54442b",
  "361c0e",
  "570211",
  "7e3110",
  "004540",
  "032c4d",
  "360825",
];

export const createBookGeometry = (book, loader) => {
  const numPages = parseInt(book.book?.num_pages || "400", 10);
  const bookId = parseInt(
    book?.book_id || Math.floor(Math.random() * 5000),
    10,
  );

  const bookHeight = 10;
  const bookWidth = 7;
  const bookDepth = Math.max(1.3, Math.min(1.5 - (400 - numPages) / 400, 2));
  const bookColor = "#" + colors[bookId % colors.length];
  const bookPageColor = 0xffffff;

  const coverWidth = 0.2;

  // Create the outer cover
  const frontCoverGeometry = new THREE.BoxGeometry(
    0.05,
    bookHeight - 0.5,
    bookWidth - 0.8,
  );

  const frontCoverMaterial = new THREE.MeshStandardMaterial({
    map: loader.load(book.book_medium_image_url),
  }); // front cover
  frontCoverMaterial.map.minFilter = THREE.LinearFilter;

  const frontCoverMaterials = [
    frontCoverMaterial,
    new THREE.MeshStandardMaterial({ color: bookColor }), // brown sides
    new THREE.MeshStandardMaterial({ color: bookColor }), // brown sides
    new THREE.MeshStandardMaterial({ color: bookColor }), // brown sides
    new THREE.MeshStandardMaterial({ color: bookColor }), // back cover
    new THREE.MeshStandardMaterial({ color: bookColor }), // brown sides
  ];
  const frontCoverMesh = new THREE.Mesh(
    frontCoverGeometry,
    frontCoverMaterials,
  );
  frontCoverMesh.position.set(bookDepth / 2 + coverWidth / 2, 0, -0.1);
  frontCoverMesh.receiveShadow = true;

  const frontGeometry = createRectangleWithRoundedEdges(
    coverWidth,
    bookHeight,
    bookWidth,
    0.04,
  );

  const frontMesh = new THREE.Mesh(
    frontGeometry,
    new THREE.MeshStandardMaterial({ color: bookColor }),
  );
  frontMesh.position.set(bookDepth / 2, 0, 0);
  frontMesh.castShadow = true;
  frontMesh.receiveShadow = true;

  // Create the outer cover
  const backCoverGeometry = createRectangleWithRoundedEdges(
    coverWidth,
    bookHeight,
    bookWidth,
    0.04,
  );
  const backCoverMesh = new THREE.Mesh(
    backCoverGeometry,
    new THREE.MeshStandardMaterial({ color: bookColor }),
  );
  backCoverMesh.position.set(-bookDepth / 2, 0, 0);
  backCoverMesh.castShadow = true;
  backCoverMesh.receiveShadow = true;

  const pageHeightOffset = 0.4;
  const pageWidthOffset = 0.3;

  // Create the pages
  const pageGeometry = new THREE.BoxGeometry(
    bookDepth - coverWidth,
    bookHeight - pageHeightOffset,
    bookWidth - pageWidthOffset,
  );
  const pageMaterial = new THREE.MeshStandardMaterial({ color: bookPageColor });
  const pageMesh = new THREE.Mesh(pageGeometry, pageMaterial);
  pageMesh.position.set(0, 0, pageWidthOffset / 2);
  pageMesh.castShadow = true;
  pageMesh.receiveShadow = true;

  // Create the spine texture
  const canvas = document.createElement("canvas");
  canvas.width = bookDepth * 20;
  canvas.height = bookHeight * 20;
  const context = canvas.getContext("2d")!;
  const canvasColor = new THREE.Color(bookColor).convertSRGBToLinear();

  context.fillStyle = canvasColor.getStyle();
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#e2e2e2";
  context.font = "bold 18px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.rotate(-Math.PI / 2);

  let title = book.title;
  let subtitle = title.match(/ \((.*)\)/);
  if (!subtitle) {
    subtitle = title.match(/: (.*)/);
  }
  if (subtitle) {
    title = title.replace(subtitle[0], "");
    context.font = `bold ${18 - Math.floor(title.length / 4)}px Arial`;

    context.fillText(title, -canvas.height / 2, canvas.width / 2 - 5);

    const sub = subtitle[1];
    context.font = `bold ${14 - Math.floor(sub.length / 5)}px Arial`;
    context.fillText(sub, -canvas.height / 2, canvas.width / 2 + 8);
  } else {
    context.font = `bold ${18 - Math.floor(title.length / 4)}px Arial`;
    context.fillText(title, -canvas.height / 2, canvas.width / 2);
  }

  const spineTexture = new THREE.CanvasTexture(canvas);
  const spineMaterial = new THREE.MeshStandardMaterial({
    map: spineTexture,
  });
  spineMaterial.map.minFilter = THREE.LinearFilter;

  // Create the spine
  const spineGeometry = new THREE.BoxGeometry(
    bookDepth,
    bookHeight,
    coverWidth,
  );
  const spineMaterials = [
    new THREE.MeshStandardMaterial({ color: bookColor }), // brown sides
    new THREE.MeshStandardMaterial({ color: bookColor }), // brown sides
    new THREE.MeshStandardMaterial({ color: bookColor }), // brown sides
    new THREE.MeshStandardMaterial({ color: bookColor }), // back cover
    spineMaterial,
    new THREE.MeshStandardMaterial({ color: bookColor }), // brown sides
  ];
  const spineMesh = new THREE.Mesh(spineGeometry, spineMaterials);
  spineMesh.position.set(0, 0, bookWidth / 2);

  // Group the cover, pages, and spine together
  const bookGroup = new THREE.Group();
  bookGroup.add(frontCoverMesh);
  bookGroup.add(frontMesh);
  bookGroup.add(backCoverMesh);
  bookGroup.add(pageMesh);
  bookGroup.add(spineMesh);

  return bookGroup;
};
