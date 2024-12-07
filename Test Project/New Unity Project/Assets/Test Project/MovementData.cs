using System;

[Serializable]
public class MovementData
{
    public Position position;

    public string eventType = "positionUpdate";

    [Serializable]
    public class Position
    {
        public double x;
        public double y;
        public double z;
    }
}

