import * as React from "react";
import { Image, StyleSheet, View } from "react-native";
import { ImageCropOverlay } from "./ImageCropOverlay";
import { useRecoilState } from "recoil";
import { imageDataState, imageBoundsState, imageScaleFactorState, editingModeState, glContextState } from "./Store";
import { GLView } from "expo-gl";

function EditingWindow() {
  //
  const [imageLayout, setImageLayout] = React.useState(null);
  const [imageData] = useRecoilState(imageDataState);
  const [, setImageBounds] = useRecoilState(imageBoundsState);
  const [, setImageScaleFactor] = useRecoilState(imageScaleFactorState);
  const [editingMode] = useRecoilState(editingModeState);
  const [, setGLContext] = useRecoilState(glContextState); // Get some readable boolean states

  const isCropping = editingMode === "crop";
  const isBlurring = editingMode === "blur";
  const usesGL = isBlurring;

  const getImageFrame = layout => {
    onUpdateCropLayout(layout);
  };

  const onUpdateCropLayout = layout => {
    // Check layout is not null
    if (layout) {
      // Find the start point of the photo on the screen and its
      // width / height from there
      const editingWindowAspectRatio = layout.height / layout.width; //

      const imageAspectRatio = imageData.height / imageData.width;
      let bounds = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      };
      let imageScaleFactor = 1; // Check which is larger

      if (imageAspectRatio > editingWindowAspectRatio) {
        // Then x is non-zero, y is zero; calculate x...
        bounds.x = (imageAspectRatio - editingWindowAspectRatio) / imageAspectRatio * layout.width / 2;
        bounds.width = layout.height / imageAspectRatio;
        bounds.height = layout.height;
        imageScaleFactor = imageData.height / layout.height;
      } else {
        // Then y is non-zero, x is zero; calculate y...
        bounds.y = (1 / imageAspectRatio - 1 / editingWindowAspectRatio) / (1 / imageAspectRatio) * layout.height / 2;
        bounds.width = layout.width;
        bounds.height = layout.width * imageAspectRatio;
        imageScaleFactor = imageData.width / layout.width;
      }

      setImageBounds(bounds);
      setImageScaleFactor(imageScaleFactor);
      setImageLayout({
        height: layout.height,
        width: layout.width
      });
    }
  };

  const getGLLayout = () => {
    if (imageLayout) {
      const {
        height: windowHeight,
        width: windowWidth
      } = imageLayout;
      const windowAspectRatio = windowWidth / windowHeight;
      const {
        height: imageHeight,
        width: imageWidth
      } = imageData;
      const imageAspectRatio = imageWidth / imageHeight; // If the window is taller than img...

      if (windowAspectRatio < imageAspectRatio) {
        return {
          width: windowWidth,
          height: windowWidth / imageAspectRatio
        };
      } else {
        return {
          height: windowHeight,
          width: windowHeight * imageAspectRatio
        };
      }
    }
  };

  React.useEffect(() => {
    onUpdateCropLayout(imageLayout);
  }, [imageData]);

  const onGLContextCreate = async gl => {
    setGLContext(gl);
  };

  return /*#__PURE__*/React.createElement(View, {
    style: styles.container
  }, usesGL ? /*#__PURE__*/React.createElement(View, {
    style: styles.glContainer
  }, /*#__PURE__*/React.createElement(GLView, {
    style: [{
      height: 1,
      width: 1,
      backgroundColor: "#ccc",
      transform: [{
        scaleY: -1
      }]
    }, getGLLayout()],
    onContextCreate: onGLContextCreate
  })) : /*#__PURE__*/React.createElement(Image, {
    style: styles.image,
    source: {
      uri: imageData.uri
    },
    onLayout: ({
      nativeEvent
    }) => getImageFrame(nativeEvent.layout)
  }), isCropping && imageLayout != null ? /*#__PURE__*/React.createElement(ImageCropOverlay, null) : null);
}

export { EditingWindow };
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  image: {
    flex: 1,
    resizeMode: "contain"
  },
  glContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});
//# sourceMappingURL=EditingWindow.js.map