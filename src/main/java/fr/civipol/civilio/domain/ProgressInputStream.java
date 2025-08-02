package fr.civipol.civilio.domain;


import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;

public class ProgressInputStream extends FilterInputStream {
    private long bytesRead = 0L;
    private final long totalLength;
    private final ProgressListener listener;

    public interface ProgressListener {
        void onProgress(long bytesRead, long totalBytes);
    }

    /**
     * Creates a {@code FilterInputStream}
     * by assigning the  argument {@code in}
     * to the field {@code this.in} to
     * remember it for later use.
     *
     * @param in the underlying input stream, or {@code null} if
     *           this instance is to be created without an underlying stream.
     */
    public ProgressInputStream(InputStream in, long totalLength, ProgressListener listener) {
        super(in);
        this.totalLength = totalLength;
        this.listener = listener;
    }

    @Override
    public int read() throws IOException {
        final var result = super.read();
        if (result != -1) {
            bytesRead++;
            listener.onProgress(bytesRead, totalLength);
        }
        return result;
    }

    @Override
    public int read(byte[] b, int off, int len) throws IOException {
        int result = super.read(b, off, len);
        if (result != -1) {
            bytesRead += result;
            listener.onProgress(bytesRead, totalLength);
        }
        return result;
    }
}
