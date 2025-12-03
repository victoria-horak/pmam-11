namespace Jarvice.VoiceListener.Interfaces;

public interface IVoiceListener
{
	Task StartAsync(CancellationToken cancellationToken);
	Task StopAsync(CancellationToken cancellationToken);
}
