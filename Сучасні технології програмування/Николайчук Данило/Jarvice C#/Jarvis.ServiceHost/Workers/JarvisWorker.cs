using Jarvice.SpeechService.Enums;
using Jarvice.SpeechService.Interfaces;
using Jarvice.VoiceListener.Interfaces;

public class JarvisWorker : BackgroundService
{
	private readonly ILogger<JarvisWorker> _logger;
	private readonly IVoiceListener _listener;
	private readonly ISpeechService _speechService;

	public JarvisWorker(ILogger<JarvisWorker> logger,
		IVoiceListener listener,
		ISpeechService speechService)
	{
		_logger = logger;
		_listener = listener;
		_speechService = speechService;
	}

	protected override async Task ExecuteAsync(CancellationToken stoppingToken)
	{
		_speechService.Speak(VoiceResponse.WelcomeSir);
		_logger.LogInformation("Jarvis voice listener starting...");
		await _listener.StartAsync(stoppingToken);
	}

	public override async Task StopAsync(CancellationToken cancellationToken)
	{
		await _listener.StopAsync(cancellationToken);
		await base.StopAsync(cancellationToken);
	}
}
