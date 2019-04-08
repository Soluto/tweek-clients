using System;

namespace Tweek.Client
{
    public class TweekCallErrorArgs : EventArgs
    {
        public TimeSpan TimeElapsed { get; set; }
        public Exception Exception { get; set; }
    }
}
