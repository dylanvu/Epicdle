declare module "mp3-parser" {
  /** Section metadata present on all parsed structures */
  export interface Mp3Section {
    type: string;
    offset: number;
    byteLength: number;
  }

  /** Section metadata for MP3 frames, includes sample info */
  export interface Mp3FrameSection extends Mp3Section {
    type: "frame";
    sampleLength: number;
    nextFrameIndex: number;
  }

  /** Frame header information */
  export interface Mp3FrameHeader {
    _section: {
      type: "frameHeader";
      byteLength: number;
      offset: number;
    };
    mpegAudioVersionBits: string;
    mpegAudioVersion: string;
    layerDescriptionBits: string;
    layerDescription: string;
    isProtected: number;
    protectionBit: string;
    bitrateBits: string;
    bitrate: number | "free" | "bad";
    samplingRateBits: string;
    samplingRate: number | "reserved";
    frameIsPaddedBit: string;
    frameIsPadded: boolean;
    framePadding: number;
    privateBit: string;
    channelModeBits: string;
    channelMode: string;
  }

  /** Complete MP3 frame structure */
  export interface Mp3Frame {
    _section: Mp3FrameSection;
    header: Mp3FrameHeader;
  }

  /** ID3v2 tag section */
  export interface Mp3Id3v2Section extends Mp3Section {
    type: "ID3v2";
  }

  /** ID3v2 tag header */
  export interface Mp3Id3v2Header {
    majorVersion: number;
    minorRevision: number;
    flagsOctet: number;
    unsynchronisationFlag: boolean;
    extendedHeaderFlag: boolean;
    experimentalIndicatorFlag: boolean;
    size: number;
  }

  /** Complete ID3v2 tag structure */
  export interface Mp3Id3v2Tag {
    _section: Mp3Id3v2Section;
    header: Mp3Id3v2Header;
    frames: unknown[];
  }

  /**
   * Read and return description of frame located at `offset` of DataView `view`.
   * If `requireNextFrame` is set, the presence of a next valid frame will be
   * required for this frame to be regarded as valid.
   * Returns null if no frame is found at `offset`.
   */
  export function readFrame(
    view: DataView,
    offset: number,
    requireNextFrame?: boolean
  ): Mp3Frame | null;

  /**
   * Read and return description of ID3v2 Tag located at `offset` of DataView `view`.
   * Returns null if no tag is found at `offset`.
   */
  export function readId3v2Tag(
    view: DataView,
    offset: number
  ): Mp3Id3v2Tag | null;

  /**
   * Read and return description of frame header at `offset` of DataView `view`.
   * Returns null if no frame header is found at `offset`.
   */
  export function readFrameHeader(
    view: DataView,
    offset: number
  ): Mp3FrameHeader | null;

  /**
   * Locate and return description of the very last valid frame in given DataView.
   */
  export function readLastFrame(
    view: DataView,
    offset?: number,
    requireNextFrame?: boolean
  ): Mp3Frame | null;

  /**
   * Read and return description of Xing/Lame Tag at `offset`.
   */
  export function readXingTag(
    view: DataView,
    offset: number
  ): unknown | null;

  /**
   * Read and return descriptions of all tags found up to (and including) the first frame.
   */
  export function readTags(
    view: DataView,
    offset?: number
  ): unknown[];
}
